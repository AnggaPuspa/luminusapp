import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSubscriptionExpiredEmail } from "@/lib/email";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const expirationLimit = new Date(now);
        expirationLimit.setDate(expirationLimit.getDate() - 7); // 7 days past end period

        // Find PAST_DUE subs that are older than 7 days
        const expiredSubs = await prisma.userSubscription.findMany({
            where: {
                status: "PAST_DUE",
                currentPeriodEnd: { lte: expirationLimit }
            },
            select: { id: true, userId: true }
        });

        const subIds = expiredSubs.map((s: any) => s.id);
        const userIds = expiredSubs.map((s: any) => s.userId);

        if (subIds.length > 0) {
            // 1. Mark subscription as EXPIRED
            await prisma.userSubscription.updateMany({
                where: { id: { in: subIds } },
                data: { status: "EXPIRED", cancelledAt: now, cancelReason: "Non-payment" }
            });

            // 2. Suspend enrollments — but ONLY for users who have NO other active subscription
            // This prevents accidentally suspending enrollments from a different active plan
            for (const expiredSub of expiredSubs) {
                const hasOtherActiveSub = await prisma.userSubscription.findFirst({
                    where: {
                        userId: expiredSub.userId,
                        status: "ACTIVE",
                        id: { not: expiredSub.id },
                        currentPeriodEnd: { gt: now }
                    }
                });

                if (!hasOtherActiveSub) {
                    await prisma.enrollment.updateMany({
                        where: {
                            userId: expiredSub.userId,
                            source: "SUBSCRIPTION"
                        },
                        data: { status: "SUSPENDED" }
                    });
                }
            }

            // 3. Mark pending invoices as FAILED
            await prisma.subscriptionInvoice.updateMany({
                where: {
                    subscriptionId: { in: subIds },
                    status: "PENDING"
                },
                data: { status: "FAILED", failureReason: "Expired before payment", failedAt: now }
            });

            // 4. Send "Subscription Terminated" email
            for (const expiredSub of expiredSubs) {
                const subDetail = await prisma.userSubscription.findUnique({
                    where: { id: expiredSub.id },
                    include: { user: true, plan: true }
                });

                if (subDetail?.user && subDetail?.plan) {
                    sendSubscriptionExpiredEmail(
                        subDetail.user.name || "Siswa",
                        subDetail.user.email,
                        subDetail.plan.name
                    ).catch((err: any) => console.error("Subscription Expired email error:", err));
                }
            }

            console.log(`[Cron] Expired ${subIds.length} subscriptions due to non-payment.`);
        }

        return NextResponse.json({ success: true, expiredCount: subIds.length });

    } catch (error: any) {
        console.error("Cron Error (expire-subscriptions):", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
