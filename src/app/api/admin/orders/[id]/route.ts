import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const order = await prisma.transaction.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                    }
                },
                webhookLogs: {
                    orderBy: {
                        receivedAt: 'desc'
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json(
            { error: "Failed to fetch order details" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!["PAID", "FAILED", "EXPIRED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
        }

        // Get the current transaction
        const transaction = await prisma.transaction.findUnique({
            where: { id }
        });

        if (!transaction) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Start a database transaction to ensure atomicity
        const updatedOrder = await prisma.$transaction(async (tx: any) => {
            // 1. Update the transaction status
            const updatedTx = await tx.transaction.update({
                where: { id },
                data: {
                    status,
                    ...(status === "PAID" && { paidAt: new Date() })
                },
                include: {
                    user: { select: { name: true, email: true } },
                    course: { select: { title: true } }
                }
            });

            // 2. If status is PAID and was not previously PAID, create enrollment
            if (status === "PAID" && transaction.status !== "PAID") {
                await tx.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: transaction.userId,
                            courseId: transaction.courseId
                        }
                    },
                    update: {
                        status: "ACTIVE" // Reactivate if it existed but was inactive
                    },
                    create: {
                        userId: transaction.userId,
                        courseId: transaction.courseId,
                        status: "ACTIVE"
                    }
                });

                // Increment coupon usage if a coupon was applied
                if (transaction.couponId) {
                    await (tx as any).coupon.update({
                        where: { id: transaction.couponId },
                        data: { usedCount: { increment: 1 } }
                    });
                }
            }

            return updatedTx;
        });

        // Trigger email outside of the transaction block
        if (status === "PAID" && transaction.status !== "PAID" && updatedOrder.user && updatedOrder.course) {
            sendPaymentSuccessEmail(
                updatedOrder.user.name || "Student",
                updatedOrder.user.email,
                updatedOrder.course.title,
                transaction.amount
            ).catch(err => console.error("Admin order email error:", err));
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}
