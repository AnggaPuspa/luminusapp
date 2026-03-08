import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { checkSubscriberAccess } from "@/lib/access-control";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch counts + recent courses for the student overview
        const [activeCourses, completedLessons, totalTransactions, pendingTransactions, recentEnrollments] = await Promise.all([
            prisma.enrollment.count({
                where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
            }),
            prisma.lessonProgress.count({
                where: { userId, completed: true },
            }),
            prisma.transaction.count({
                where: { userId },
            }),
            prisma.transaction.count({
                where: { userId, status: "PENDING" },
            }),
            prisma.enrollment.findMany({
                where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
                orderBy: { enrolledAt: "desc" },
                take: 3,
                include: {
                    course: {
                        select: {
                            id: true, title: true, slug: true, thumbnailUrl: true,
                            modules: {
                                include: {
                                    lessons: {
                                        select: {
                                            id: true,
                                            progress: {
                                                where: { userId, completed: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
        ]);

        const recentCourses = recentEnrollments.map((e: any) => {
            const course = e.course;
            let totalLessons = 0;
            let completedCourseLessons = 0;

            course.modules.forEach((module: any) => {
                totalLessons += module.lessons.length;
                module.lessons.forEach((lesson: any) => {
                    if (lesson.progress && lesson.progress.length > 0) {
                        completedCourseLessons++;
                    }
                });
            });

            const progressPercent = totalLessons === 0 ? 0 : Math.round((completedCourseLessons / totalLessons) * 100);

            return {
                id: course.id,
                title: course.title,
                slug: course.slug,
                thumbnailUrl: course.thumbnailUrl,
                enrolledAt: e.enrolledAt,
                totalLessons,
                completedLessons: completedCourseLessons,
                progressPercent
            };
        });

        const subscriptionDetails = await checkSubscriberAccess(userId);

        return NextResponse.json({
            activeCourses,
            completedLessons,
            totalTransactions,
            pendingTransactions,
            recentCourses: recentCourses,
            subscription: subscriptionDetails
        }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student dashboard overview data:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
