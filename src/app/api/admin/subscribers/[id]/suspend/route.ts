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

        // Suspend logic: set status to EXPIRED and disable active enrollments tied to subscription
        await prisma.$transaction([
            prisma.userSubscription.update({
                where: { id },
                data: {
                    status: 'EXPIRED',
                    cancelledAt: new Date(),
                    cancelReason: 'Suspended by Admin'
                }
            }),
            prisma.enrollment.updateMany({
                where: {
                    userId: subscription.userId,
                    source: 'SUBSCRIPTION',
                    status: 'ACTIVE'
                },
                data: { status: 'SUSPENDED' }
            })
        ]);

        return NextResponse.json({ message: "Subscription suspended successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Suspend error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
