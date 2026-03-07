import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string, moduleId: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug, moduleId } = await params;
        const body = await request.json();
        const { answers } = body; // Expected format: Record<string, number> -> { questionId: selectedIndex }

        if (!answers || typeof answers !== 'object') {
            return NextResponse.json({ message: "Invalid answers format" }, { status: 400 });
        }

        // 1. Verify user is enrolled (unless admin)
        if (session.user.role !== "ADMIN") {
            const course = await prisma.course.findUnique({
                where: { slug },
                include: {
                    enrollments: {
                        where: { userId: session.user.id, status: "ACTIVE" }
                    }
                }
            });

            if (!course || course.enrollments.length === 0) {
                return NextResponse.json({ message: "Not enrolled" }, { status: 403 });
            }
        }

        // 2. Fetch the quiz WITH the correct answers mapped
        const quiz = await prisma.quiz.findUnique({
            where: { moduleId },
            include: {
                questions: true
            }
        });

        if (!quiz) {
            return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
        }

        if (quiz.questions.length === 0) {
            return NextResponse.json({ message: "Quiz has no questions" }, { status: 400 });
        }

        // 3. Grade the submission
        let score = 0;
        const totalQ = quiz.questions.length;
        const gradedAnswers = [];

        for (const question of quiz.questions) {
            const submittedIndex = answers[question.id];
            const isCorrect = submittedIndex === question.correctIndex;

            if (isCorrect) score++;

            gradedAnswers.push({
                questionId: question.id,
                selectedIndex: submittedIndex ?? null,
                isCorrect,
                correctIndex: question.correctIndex // Reveal it only after submission
            });
        }

        // 4. Save the attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: session.user.id,
                quizId: quiz.id,
                score,
                totalQ,
                answers: gradedAnswers
            }
        });

        return NextResponse.json({
            message: "Quiz submitted successfully",
            score,
            totalQ,
            percentage: Math.round((score / totalQ) * 100),
            gradedAnswers // so the UI can show which ones were wrong
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error submitting student quiz:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
