import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { checkCourseAccess } from "@/lib/access-control";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ message: "courseId is required" }, { status: 400 });
        }

        const userId = session.user.id;

        // Check course access using existing access-control logic
        const access = await checkCourseAccess(userId, courseId);

        // Check if user has progress (completed >= 1 lesson)
        let hasProgress = false;
        if (access.hasAccess) {
            const completedLessonCount = await prisma.lessonProgress.count({
                where: {
                    userId,
                    completed: true,
                    lesson: {
                        module: {
                            courseId
                        }
                    }
                }
            });
            hasProgress = completedLessonCount >= 1;
        }

        return NextResponse.json({
            hasAccess: access.hasAccess,
            accessType: access.accessType,
            hasProgress,
        });

    } catch (error: any) {
        console.error("Failed to check course access:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
