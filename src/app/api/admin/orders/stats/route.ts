import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get("month");
        const yearParam = searchParams.get("year");

        const now = new Date();
        const year = yearParam ? parseInt(yearParam) : now.getFullYear();
        
        const isAllMonths = monthParam === 'all';
        const month = !isAllMonths && monthParam ? parseInt(monthParam) : now.getMonth(); // 0-indexed

        // Current period date range
        const startOfPeriod = isAllMonths ? new Date(year, 0, 1) : new Date(year, month, 1);
        const endOfPeriod = isAllMonths ? new Date(year + 1, 0, 1) : new Date(year, month + 1, 1);

        // Previous period date range
        const startOfPrevPeriod = isAllMonths ? new Date(year - 1, 0, 1) : new Date(year, month - 1, 1);
        const endOfPrevPeriod = isAllMonths ? new Date(year, 0, 1) : new Date(year, month, 1);

        // Calculate steps for chart (days in month OR 12 months in year)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const chartSteps = isAllMonths ? 12 : daysInMonth;

        // queries
        const [
            currentPaid,
            currentTotal,
            prevPaid,
            prevTotal,
            chartRaw
        ] = await Promise.all([
            // Current period paid
            prisma.transaction.aggregate({
                _sum: { amount: true },
                _count: { id: true },
                where: {
                    status: "PAID",
                    createdAt: { gte: startOfPeriod, lt: endOfPeriod }
                }
            }),
            // Current period all (for Total Orders)
            prisma.transaction.count({
                where: {
                    createdAt: { gte: startOfPeriod, lt: endOfPeriod }
                }
            }),
            // Prev period paid
            prisma.transaction.aggregate({
                _sum: { amount: true },
                _count: { id: true },
                where: {
                    status: "PAID",
                    createdAt: { gte: startOfPrevPeriod, lt: endOfPrevPeriod }
                }
            }),
            // Prev period all
            prisma.transaction.count({
                where: {
                    createdAt: { gte: startOfPrevPeriod, lt: endOfPrevPeriod }
                }
            }),
            // Chart count (group by day if month, group by month if year)
            isAllMonths ? 
                prisma.$queryRaw<{ step: number, count: number }[]>`
                    SELECT 
                        CAST(EXTRACT(MONTH FROM "createdAt") AS INTEGER) as step,
                        CAST(COUNT(*) AS INTEGER) as count
                    FROM transactions
                    WHERE status = 'PAID'
                    AND "createdAt" >= ${startOfPeriod}
                    AND "createdAt" < ${endOfPeriod}
                    GROUP BY step
                    ORDER BY step ASC
                ` 
                :
                prisma.$queryRaw<{ step: number, count: number }[]>`
                    SELECT 
                        CAST(EXTRACT(DAY FROM "createdAt") AS INTEGER) as step,
                        CAST(COUNT(*) AS INTEGER) as count
                    FROM transactions
                    WHERE status = 'PAID'
                    AND "createdAt" >= ${startOfPeriod}
                    AND "createdAt" < ${endOfPeriod}
                    GROUP BY step
                    ORDER BY step ASC
                `
        ]);

        const chartMap = new Map();
        chartRaw.forEach((row: any) => {
            chartMap.set(row.step, row.count);
        });

        const dailyChart = [];
        for (let i = 1; i <= chartSteps; i++) {
            dailyChart.push({
                day: i,
                count: chartMap.get(i) || 0
            });
        }

        return NextResponse.json({
            stats: {
                totalEarnings: currentPaid._sum.amount || 0,
                prevEarnings: prevPaid._sum.amount || 0,
                totalSales: currentPaid._count.id,
                prevSales: prevPaid._count.id,
                totalOrders: currentTotal,
                prevTotalOrders: prevTotal,
                completedOrders: currentPaid._count.id, 
                prevCompleted: prevPaid._count.id,
            },
            dailyChart
        });
    } catch (error: any) {
        console.error("Failed to fetch order stats:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
