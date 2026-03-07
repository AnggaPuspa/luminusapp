import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// Create a new Quiz for a Module
export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { moduleId, title } = body;

        if (!moduleId || !title) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if module already has a quiz
        const existingQuiz = await prisma.quiz.findUnique({
            where: { moduleId }
        });

        if (existingQuiz) {
            return NextResponse.json({ error: "Module already has a quiz" }, { status: 400 });
        }

        const quiz = await prisma.quiz.create({
            data: {
                moduleId,
                title
            },
            include: {
                questions: true
            }
        });

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error("Error creating quiz:", error);
        return NextResponse.json(
            { error: "Failed to create quiz" },
            { status: 500 }
        );
    }
}
