import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const gracePeriodEnd = new Date(now);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 3); // 3 days ago

        // Find subscriptions that are ACTIVE but their period ended more than 3 days ago
        // and they likely have a PENDING invoice that hasn't been paid
        const pastDueSubs = await prisma.userSubscription.findMany({
            where: {
                status: "ACTIVE",
                currentPeriodEnd: { lte: gracePeriodEnd }
            },
            select: { id: true }
        });

        const subIds = pastDueSubs.map((s: any) => s.id);

        if (subIds.length > 0) {
            await prisma.userSubscription.updateMany({
                where: { id: { in: subIds } },
                data: { status: "PAST_DUE" }
            });

            // TODO: Send "Past Due Warning" email to these users
        }

        return NextResponse.json({ success: true, updatedCount: subIds.length, subs: subIds });

    } catch (error: any) {
        console.error("Cron Error (mark-past-due):", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
