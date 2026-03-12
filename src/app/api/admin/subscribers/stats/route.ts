import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized accesses. Admin only." }, { status: 401 });
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

        // Calculate steps for chart
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const chartSteps = isAllMonths ? 12 : daysInMonth;

        // queries
        const [
            totalActive,
            prevActiveApprox,
            currentSignups,
            prevSignups,
            currentChurn,
            prevChurn,
            currentAiSession, 
            prevAiSession,
            chartRaw
        ] = await Promise.all([
            // 1. Total Active during selected period
            prisma.userSubscription.count({
                where: {
                    createdAt: { lt: endOfPeriod },
                    currentPeriodEnd: { gte: startOfPeriod }
                }
            }),
            // 2. Total Active during prev period
            prisma.userSubscription.count({
                where: {
                    createdAt: { lt: endOfPrevPeriod },
                    currentPeriodEnd: { gte: startOfPrevPeriod }
                }
            }),
            // 3. New signups this period
            prisma.userSubscription.count({
                where: {
                    createdAt: { gte: startOfPeriod, lt: endOfPeriod }
                }
            }),
            // 4. New signups prev period
            prisma.userSubscription.count({
                where: {
                    createdAt: { gte: startOfPrevPeriod, lt: endOfPrevPeriod }
                }
            }),
            // 5. Churned this period
            prisma.userSubscription.count({
                where: {
                    status: { in: ["EXPIRED", "CANCELLED"] },
                    updatedAt: { gte: startOfPeriod, lt: endOfPeriod }
                }
            }),
            // 6. Churned prev period
            prisma.userSubscription.count({
                where: {
                    status: { in: ["EXPIRED", "CANCELLED"] },
                    updatedAt: { gte: startOfPrevPeriod, lt: endOfPrevPeriod }
                }
            }),
            // 7. AI Chats used by subs active during selected period
            prisma.userSubscription.aggregate({
                _sum: { aiChatUsedThisMonth: true },
                where: {
                    createdAt: { lt: endOfPeriod },
                    currentPeriodEnd: { gte: startOfPeriod }
                }
            }),
            // 8. Prev AI Chats
            prisma.userSubscription.aggregate({
                _sum: { aiChatUsedThisMonth: true },
                where: {
                    createdAt: { lt: endOfPrevPeriod },
                    currentPeriodEnd: { gte: startOfPrevPeriod }
                }
            }),
            // 9. Daily/monthly signups for chart
            isAllMonths ?
                prisma.$queryRaw<{ step: number, count: number }[]>`
                    SELECT 
                        CAST(EXTRACT(MONTH FROM "createdAt") AS INTEGER) as step,
                        CAST(COUNT(*) AS INTEGER) as count
                    FROM user_subscriptions
                    WHERE "createdAt" >= ${startOfPeriod}
                    AND "createdAt" < ${endOfPeriod}
                    GROUP BY step
                    ORDER BY step ASC
                ` 
                :
                prisma.$queryRaw<{ step: number, count: number }[]>`
                    SELECT 
                        CAST(EXTRACT(DAY FROM "createdAt") AS INTEGER) as step,
                        CAST(COUNT(*) AS INTEGER) as count
                    FROM user_subscriptions
                    WHERE "createdAt" >= ${startOfPeriod}
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

        // Calculate churn rate = (Churned in Period / Total Active at Start of Period) * 100
        const startActiveCount = prevActiveApprox || 1; // avoid /0
        const churnRateStr = ((currentChurn / startActiveCount) * 100).toFixed(1);

        const prevStartActiveCount = Math.max(startActiveCount - prevSignups + prevChurn, 1);
        const prevChurnRateStr = ((prevChurn / prevStartActiveCount) * 100).toFixed(1);

        return NextResponse.json({
            stats: {
                totalActive,
                prevActiveApprox,
                newSignups: currentSignups,
                prevSignups,
                churnRate: parseFloat(churnRateStr),
                prevChurnRate: parseFloat(prevChurnRateStr),
                totalAiChats: currentAiSession._sum.aiChatUsedThisMonth || 0,
                prevAiChats: prevAiSession._sum.aiChatUsedThisMonth || 0,
            },
            dailyChart
        });
    } catch (error: any) {
        console.error("Failed to fetch subscriber stats:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
