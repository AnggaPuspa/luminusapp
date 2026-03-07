import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { lessonId } = body;

        if (!lessonId) {
            return NextResponse.json({ message: "lessonId is required" }, { status: 400 });
        }

        // Verify lesson exists & get courseId to check enrollment
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    select: { courseId: true }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
        }

        // Security check: Verify enrollment if user is not ADMIN
        if (session.user.role !== "ADMIN") {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId: lesson.module.courseId,
                    }
                }
            });

            if (!enrollment || enrollment.status !== "ACTIVE") {
                return NextResponse.json(
                    { message: "Access Denied: Not enrolled in this course." },
                    { status: 403 }
                );
            }
        }

        // Mark as completed
        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                }
            },
            update: {
                completed: true,
                completedAt: new Date(),
            },
            create: {
                userId,
                lessonId,
                completed: true,
                completedAt: new Date(),
            }
        });

        return NextResponse.json({ message: "Lesson marked as completed", progress }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to update lesson progress:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
