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

        // 1. Get active subscription
        const activeSub = await prisma.userSubscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                currentPeriodEnd: { gt: new Date() }
            },
            include: {
                plan: {
                    include: {
                        includedCourses: true
                    }
                }
            }
        });

        if (!activeSub) {
            // If no active subscription, just return empty array
            return NextResponse.json({ courses: [] }, { status: 200 });
        }

        const isAllCoursesIncluded = activeSub.plan.allCoursesIncluded;
        const includedCourseIds = activeSub.plan.includedCourses.map(pc => pc.courseId);

        // 2. Get user's enrollments WITH progress to determine which to exclude
        // Netflix-style: only exclude courses where user completed >= 1 lesson
        // Courses with enrollment but 0 progress still show as "available"
        const existingEnrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                status: { in: ["ACTIVE", "COMPLETED", "SUSPENDED"] }
            },
            select: {
                courseId: true,
                course: {
                    select: {
                        modules: {
                            select: {
                                lessons: {
                                    select: {
                                        progress: {
                                            where: { userId, completed: true },
                                            select: { id: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Only exclude courses where user has completed at least 1 lesson
        const activelyLearningCourseIds = existingEnrollments
            .filter(e => {
                const completedCount = e.course.modules
                    .flatMap((m: any) => m.lessons)
                    .filter((l: any) => l.progress.length > 0)
                    .length;
                return completedCount >= 1;
            })
            .map(e => e.courseId);

        // 3. Find courses that are covered by the plan BUT NOT actively being learned
        let whereClause: any = {
            status: "PUBLISHED",
            deletedAt: null,
            id: { notIn: activelyLearningCourseIds }
        };

        if (!isAllCoursesIncluded) {
            whereClause.id.in = includedCourseIds;
        }

        const availableCourses = await prisma.course.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                thumbnailUrl: true,
                duration: true,
                modules: {
                    select: { id: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Format similarly to enrolled courses for easy UI consumption
        const formattedCourses = availableCourses.map(course => ({
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            thumbnailUrl: course.thumbnailUrl,
            duration: course.duration,
            totalLessons: course.modules.length > 0 ? -1 : 0, // Mock for UI
            progressPercent: 0,
            completedLessons: 0,
            isAvailableToStart: true // Flag to identify in UI
        }));

        return NextResponse.json({ courses: formattedCourses }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch available courses:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
