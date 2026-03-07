import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, moduleId, content, videoUrl, duration, sortOrder } = body;

        if (!title || !moduleId) {
            return NextResponse.json({ message: "Title and moduleId are required" }, { status: 400 });
        }

        const newLesson = await prisma.lesson.create({
            data: {
                title,
                moduleId,
                content: content || null,
                videoUrl: videoUrl || null,
                duration: duration ? parseInt(duration) : 0,
                sortOrder: sortOrder || 0,
            },
        });

        return NextResponse.json(newLesson, { status: 201 });
    } catch (error: any) {
        console.error("Error creating lesson:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
