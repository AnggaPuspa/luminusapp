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

        // Execute all 4 queries in parallel
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [revenueResult, totalStudents, publishedCourses, recentOrders] = await Promise.all([
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { status: "PAID" }
            }),
            prisma.user.count({
                where: { role: "STUDENT" }
            }),
            prisma.course.count({
                where: { status: "PUBLISHED" }
            }),
            prisma.transaction.count({
                where: { createdAt: { gte: sevenDaysAgo } }
            })
        ]);

        const totalRevenue = revenueResult._sum.amount || 0;

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
