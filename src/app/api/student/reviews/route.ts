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
        const { courseId, rating, comment } = body;

        if (!courseId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ message: "Invalid input. CourseId and rating (1-5) are required." }, { status: 400 });
        }

        // Security check: Verify enrollment and progress
        if (session.user.role !== "ADMIN") {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId,
                    }
                }
            });

            if (!enrollment || enrollment.status !== "ACTIVE") {
                return NextResponse.json(
                    { message: "Access Denied: You must be actively enrolled to leave a review." },
                    { status: 403 }
                );
            }

            // Check progress > 50%
            const totalLessons = await prisma.lesson.count({
                where: { module: { courseId } }
            });

            const completedLessons = await prisma.lessonProgress.count({
                where: {
                    userId,
                    completed: true,
                    lesson: { module: { courseId } }
                }
            });

            const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

            if (progressPercentage < 50) {
                return NextResponse.json(
                    { message: "Anda harus menyelesaikan minimal 50% materi kelas untuk memberikan ulasan." },
                    { status: 403 }
                );
            }
        }

        // Upsert review (create or update if exists)
        const review = await prisma.courseReview.upsert({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            },
            update: {
                rating,
                comment,
                updatedAt: new Date(),
            },
            create: {
                userId,
                courseId,
                rating,
                comment,
            }
        });

        return NextResponse.json({ message: "Review submitted successfully", review }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to submit review:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
