import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, videoUrl, duration, sortOrder } = body;

        const updatedData: any = {};
        if (title !== undefined) updatedData.title = title;
        if (content !== undefined) updatedData.content = content;
        if (videoUrl !== undefined) updatedData.videoUrl = videoUrl;
        if (duration !== undefined) updatedData.duration = parseInt(duration);
        if (sortOrder !== undefined) updatedData.sortOrder = sortOrder;

        const updatedLesson = await prisma.lesson.update({
            where: { id },
            data: updatedData,
        });

        return NextResponse.json(updatedLesson, { status: 200 });
    } catch (error: any) {
        console.error("Error updating lesson:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await prisma.lesson.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Lesson deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting lesson:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
