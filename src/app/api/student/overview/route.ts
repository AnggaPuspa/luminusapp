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

        // Fetch counts + recent courses for the student overview
        const [activeCourses, completedLessons, totalTransactions, pendingTransactions, recentEnrollments] = await Promise.all([
            prisma.enrollment.count({
                where: { userId, status: "ACTIVE" },
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
                where: { userId, status: "ACTIVE" },
                orderBy: { enrolledAt: "desc" },
                take: 3,
                include: {
                    course: {
                        select: { id: true, title: true, slug: true, thumbnailUrl: true }
                    }
                }
            }),
        ]);

        const recentCourses = recentEnrollments.map((e: any) => ({
            ...e.course,
            enrolledAt: e.enrolledAt,
        }));

        return NextResponse.json({
            activeCourses,
            completedLessons,
            totalTransactions,
            pendingTransactions,
            recentCourses,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student dashboard overview data:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
