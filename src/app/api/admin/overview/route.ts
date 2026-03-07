import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        // Check if user is logged in AND is an ADMIN
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized accesses. Admin only." }, { status: 401 });
        }

        // 1. Total Revenue (Transactions with PAID status)
        const revenueResult = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: "PAID" }
        });
        const totalRevenue = revenueResult._sum.amount || 0;

        // 2. Total Students (Users with STUDENT role)
        const totalStudents = await prisma.user.count({
            where: { role: "STUDENT" }
        });

        // 3. Published Courses (Courses with PUBLISHED status)
        const publishedCourses = await prisma.course.count({
            where: { status: "PUBLISHED" }
        });

        // 4. Recent Orders count (Transactions created in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrders = await prisma.transaction.count({
            where: { createdAt: { gte: sevenDaysAgo } }
        });

        return NextResponse.json({
            totalRevenue,
            totalStudents,
            publishedCourses,
            recentOrders
        }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch dashboard overview data:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
