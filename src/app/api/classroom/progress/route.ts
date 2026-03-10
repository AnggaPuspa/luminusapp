import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { markLessonComplete } from "@/services/classroom.service";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const result = await markLessonComplete(
            session.user.id,
            body.lessonId,
            session.user.role,
            { name: session.user.name, email: session.user.email }
        );

        return NextResponse.json({
            message: "Lesson marked as completed",
            progress: result.progress,
            isCourseCompleted: result.isCourseCompleted,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to update lesson progress:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.status || 500 }
        );
    }
}
