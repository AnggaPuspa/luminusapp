import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// Create a new Question
export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { quizId, questionText, options, correctIndex, sortOrder } = body;

        if (!quizId || !questionText || !options || correctIndex === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const question = await prisma.question.create({
            data: {
                quizId,
                questionText,
                options,
                correctIndex,
                sortOrder: sortOrder || 0
            }
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json(
            { error: "Failed to create question" },
            { status: 500 }
        );
    }
}
