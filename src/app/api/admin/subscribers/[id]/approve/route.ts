import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const subscription = await prisma.userSubscription.findUnique({
            where: { id }
        });

        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        const now = new Date();

        // Calculate new period ends 
        let newStart = subscription.currentPeriodStart;
        let newEnd = subscription.currentPeriodEnd;

        // If subscription was inactive or expired, reset the start date to now
        if (subscription.status !== "ACTIVE" || subscription.currentPeriodEnd < now) {
            newStart = now;
            newEnd = new Date(now);
            if (subscription.billingCycle === "YEARLY") newEnd.setFullYear(newEnd.getFullYear() + 1);
            else newEnd.setMonth(newEnd.getMonth() + 1);
        } else {
            // It's an active renewal (paid before expiration), just extend the end date
            newEnd = new Date(subscription.currentPeriodEnd);
            if (subscription.billingCycle === "YEARLY") newEnd.setFullYear(newEnd.getFullYear() + 1);
            else newEnd.setMonth(newEnd.getMonth() + 1);
        }

        await prisma.$transaction([
            prisma.subscriptionInvoice.updateMany({
                where: { subscriptionId: id, status: "PENDING" },
                data: { status: "PAID", paidAt: now }
            }),
            prisma.userSubscription.update({
                where: { id },
                data: {
                    status: 'ACTIVE',
                    currentPeriodStart: newStart,
                    currentPeriodEnd: newEnd,
                    aiChatUsedThisMonth: 0
                }
            })
        ]);

        return NextResponse.json({ message: "Subscription approved manually" }, { status: 200 });
    } catch (error: any) {
        console.error("Approve error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
