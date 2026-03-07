import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch quiz attempts 
        const quizAttempts = await prisma.quizAttempt.findMany({
            where: { userId },
            orderBy: { score: 'desc' }, // Get best scores
            include: {
                user: { select: { name: true } },
            }
        });

        type QuizAttemptType = typeof quizAttempts[0];

        const detailedAttempts = await Promise.all(quizAttempts.map(async (attempt: QuizAttemptType) => {
            const quiz = await prisma.quiz.findUnique({
                where: { id: attempt.quizId },
                select: { title: true, module: { select: { courseId: true } } }
            });
            return {
                ...attempt,
                quizTitle: quiz?.title || "Kuis",
                courseId: quiz?.module?.courseId || null,
            };
        }));

        let avgScore = 0;
        if (quizAttempts.length > 0) {
            const sumScores = quizAttempts.reduce((acc: number, curr: QuizAttemptType) => acc + (curr.score / curr.totalQ), 0);
            avgScore = Math.round((sumScores / quizAttempts.length) * 100);
        }

        return NextResponse.json({
            bestScore: detailedAttempts.length > 0 ? detailedAttempts[0] : null,
            recentAttempts: detailedAttempts,
            avgScore
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch student analytics:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
