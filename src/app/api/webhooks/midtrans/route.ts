import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPaymentSuccessEmail, sendSubscriptionSuccessEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Verify Midtrans Signature Key
        const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
        const orderId = body.order_id;
        const statusCode = body.status_code;
        const grossAmount = body.gross_amount;
        const signatureKey = body.signature_key;

        const expectedSignature = crypto
            .createHash("sha512")
            .update(orderId + statusCode + grossAmount + serverKey)
            .digest("hex");

        if (signatureKey !== expectedSignature) {
            console.error("[Webhook] REJECTED: Invalid signature key");
            return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
        }

        const transactionStatus = body.transaction_status;
        const paymentType = body.payment_type;
        const eventName = `midtrans.${transactionStatus}`;

        let matchedTransactionId: string | null = null;

        // Try to find matching Subscription Invoice first
        let subInvoice = await prisma.subscriptionInvoice.findUnique({
            where: { id: orderId },
            include: { subscription: true }
        });

        // Try to find matching One-Time Transaction
        let transaction = null;
        if (!subInvoice) {
            transaction = await (prisma as any).transaction.findUnique({
                where: { id: orderId },
                include: { user: true, course: true }
            });
        }

        if (transaction) {
            matchedTransactionId = transaction.id;
        } else if (subInvoice) {
            matchedTransactionId = subInvoice.id;
        }

        // Handle success statuses
        if (transactionStatus === "capture" || transactionStatus === "settlement") {
            console.log(`[Webhook] Processing payment success for order_id: ${orderId}`);

            if (subInvoice && subInvoice.status === "PENDING") {
                const lockResult = await prisma.subscriptionInvoice.updateMany({
                    where: { id: subInvoice.id, status: "PENDING" },
                    data: { status: "PAID", paidAt: new Date() }
                });
                if (lockResult.count > 0) {
                    const now = new Date();
                    const sub = subInvoice.subscription;

                    let newStart = sub.currentPeriodStart;
                    let newEnd = sub.currentPeriodEnd;

                    if (sub.status !== "ACTIVE" || sub.currentPeriodEnd < now) {
                        newStart = now;
                        newEnd = new Date(now);
                        if (sub.billingCycle === "YEARLY") newEnd.setFullYear(newEnd.getFullYear() + 1);
                        else newEnd.setMonth(newEnd.getMonth() + 1);
                    } else {
                        newEnd = new Date(sub.currentPeriodEnd);
                        if (sub.billingCycle === "YEARLY") newEnd.setFullYear(newEnd.getFullYear() + 1);
                        else newEnd.setMonth(newEnd.getMonth() + 1);
                    }

                    await prisma.userSubscription.update({
                        where: { id: sub.id },
                        data: {
                            status: "ACTIVE",
                            currentPeriodStart: newStart,
                            currentPeriodEnd: newEnd,
                        }
                    });

                    const user = await prisma.user.findUnique({ where: { id: sub.userId } });
                    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId } });

                    if (user && plan) {
                        sendSubscriptionSuccessEmail(
                            user.name || "Siswa",
                            user.email,
                            plan.name,
                            subInvoice.amount,
                            sub.billingCycle
                        ).catch((err: any) => console.error("Subscription Success email error:", err));
                    }
                    console.log(`[Webhook] Subscription ${sub.id} activated/renewed successfully.`);
                }
            } else if (transaction && transaction.status === "PENDING") {
                const lockResult = await (prisma as any).transaction.updateMany({
                    where: { id: transaction.id, status: "PENDING" },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                        paymentMethod: paymentType,
                        paymentChannel: body.bank || body.issuer || body.store || "unknown"
                    }
                });
                if (lockResult.count > 0) {
                    const dbOps: any[] = [
                        prisma.enrollment.upsert({
                            where: {
                                userId_courseId: {
                                    userId: transaction.userId,
                                    courseId: transaction.courseId
                                }
                            },
                            update: { status: "ACTIVE", source: "PURCHASE" },
                            create: {
                                userId: transaction.userId,
                                courseId: transaction.courseId,
                                status: "ACTIVE",
                                source: "PURCHASE"
                            }
                        })
                    ];

                    if (transaction.couponId) {
                        dbOps.push(
                            (prisma as any).coupon.update({
                                where: { id: transaction.couponId },
                                data: { usedCount: { increment: 1 } }
                            })
                        );
                    }

                    await prisma.$transaction(dbOps);

                    sendPaymentSuccessEmail(
                        transaction.user.name,
                        transaction.user.email,
                        transaction.course.title,
                        transaction.amount
                    ).catch(err => console.error("Payment Success email error:", err));
                }
            }
        } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
            if (subInvoice && subInvoice.status === "PENDING") {
                await prisma.subscriptionInvoice.update({
                    where: { id: subInvoice.id },
                    data: { status: "FAILED", failureReason: transactionStatus }
                });
            } else if (transaction && transaction.status === "PENDING") {
                await (prisma as any).transaction.update({
                    where: { id: transaction.id },
                    data: { status: "FAILED" }
                });
            }
        }

        // Log the webhook
        await prisma.webhookLog.create({
            data: {
                event: eventName,
                payload: body,
                httpStatus: 200,
                transactionId: matchedTransactionId
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
