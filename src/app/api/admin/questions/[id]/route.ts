import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// Update or Delete a Question
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { questionText, options, correctIndex, sortOrder } = body;

        const updated = await prisma.question.update({
            where: { id },
            data: {
                ...(questionText && { questionText }),
                ...(options && { options }),
                ...(correctIndex !== undefined && { correctIndex }),
                ...(sortOrder !== undefined && { sortOrder })
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json(
            { error: "Failed to update question" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.question.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json(
            { error: "Failed to delete question" },
            { status: 500 }
        );
    }
}
