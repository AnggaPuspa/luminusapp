import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Reset AI chat quota for ALL active subscribers on the 1st of each month
        const result = await prisma.userSubscription.updateMany({
            where: {
                status: "ACTIVE",
                aiChatUsedThisMonth: { gt: 0 }
            },
            data: {
                aiChatUsedThisMonth: 0
            }
        });

        console.log(`[Cron] Reset AI quota for ${result.count} active subscriptions.`);

        return NextResponse.json({
            success: true,
            resetCount: result.count
        });

    } catch (error: any) {
        console.error("Cron Error (reset-ai-quota):", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
