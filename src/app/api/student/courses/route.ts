import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                status: { in: ["ACTIVE", "COMPLETED"] },
                course: {
                    status: "PUBLISHED",
                    deletedAt: null
                }
            },
            select: {
                enrolledAt: true,
                source: true,
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        description: true,
                        thumbnailUrl: true,
                        originalPrice: true,
                        discountedPrice: true,
                        duration: true,
                        modules: {
                            select: {
                                lessons: {
                                    select: {
                                        id: true,
                                        progress: {
                                            where: { userId },
                                            select: { completed: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { enrolledAt: "desc" },
        });

        // Transform to include progress
        const courses = enrollments.map((e: any) => {
            const allLessons = e.course.modules.flatMap((m: any) => m.lessons);
            const completedLessons = allLessons.filter(
                (l: any) => l.progress[0]?.completed === true
            );

            // Remove nested modules/lessons to save payload size, we just need progress stats
            const { modules, ...courseData } = e.course;

            return {
                ...courseData,
                userId: e.userId || userId,
                enrolledAt: e.enrolledAt,
                source: e.source,
                totalLessons: allLessons.length,
                completedLessons: completedLessons.length,
                progressPercent: allLessons.length > 0
                    ? Math.round((completedLessons.length / allLessons.length) * 100)
                    : 0,
            };
        });

        // Netflix-style threshold: only show courses where user has completed >= 1 lesson
        // Courses with 0 progress stay in "Tersedia di Paket Kamu" via available-courses endpoint
        const activeCourses = courses.filter((c: any) => c.completedLessons >= 1);

        return NextResponse.json(activeCourses, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch student courses:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
