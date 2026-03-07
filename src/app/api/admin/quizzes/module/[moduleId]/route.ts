import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// Fetch quiz (and questions) by Module ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ moduleId: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { moduleId } = await params;

        const quiz = await prisma.quiz.findUnique({
            where: { moduleId },
            include: {
                questions: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return NextResponse.json(
            { error: "Failed to fetch quiz" },
            { status: 500 }
        );
    }
}
