import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string, moduleId: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug, moduleId } = await params;

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

        // 2. Fetch the quiz for this module, WITHOUT the correctIndex
        const quiz = await prisma.quiz.findUnique({
            where: { moduleId },
            include: {
                questions: {
                    select: {
                        id: true,
                        questionText: true,
                        options: true,
                        sortOrder: true
                    },
                    orderBy: {
                        sortOrder: 'asc'
                    }
                }
            }
        });

        if (!quiz) {
            return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
        }

        // 3. Fetch user's previous attempts to show best score (optional)
        const bestAttempt = await prisma.quizAttempt.findFirst({
            where: {
                userId: session.user.id,
                quizId: quiz.id
            },
            orderBy: {
                score: 'desc'
            }
        });

        return NextResponse.json({
            quiz,
            bestScore: bestAttempt ? `${bestAttempt.score}/${bestAttempt.totalQ}` : null,
            bestScoreRaw: bestAttempt ? Math.round((bestAttempt.score / bestAttempt.totalQ) * 100) : 0
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching student quiz:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
