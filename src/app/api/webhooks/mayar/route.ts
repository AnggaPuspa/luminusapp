import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMayarWebhook } from "@/lib/mayar";
import { sendPaymentSuccessEmail, sendSubscriptionSuccessEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();

        // Mayar mengirim token autentikasi di header "x-callback-token"
        const callbackToken = request.headers.get("x-callback-token");
        const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;

        if (!callbackToken || !webhookSecret) {
            console.error("[Webhook] REJECTED: Missing x-callback-token or webhook secret not configured");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Mayar menggunakan simple token comparison (bukan HMAC)
        // x-callback-token harus sama persis dengan MAYAR_WEBHOOK_SECRET
        if (!verifyMayarWebhook(callbackToken, webhookSecret)) {
            console.error("[Webhook] REJECTED: Invalid callback token");
            return NextResponse.json({ message: "Invalid token" }, { status: 403 });
        }

        const body = JSON.parse(rawBody);
        const eventName = body.event;
        const eventData = body.data;
        let matchedTransactionId: string | null = null;

        const transactionStr = eventData?.productId || eventData?.transaction?.id || eventData?.id;
        const refId = eventData?.referenceId;

        // Try to find matching Subscription Invoice
        let subInvoice = null;
        if (transactionStr) {
            subInvoice = await prisma.subscriptionInvoice.findFirst({
                where: { mayarInvoiceId: transactionStr },
                include: { subscription: true }
            });
        }
        if (!subInvoice && refId) {
            subInvoice = await prisma.subscriptionInvoice.findFirst({
                where: { id: refId },
                include: { subscription: true }
            });
        }

        // Setup common transaction lookup for One-Time Payments
        let transaction = null;
        if (!subInvoice) {
            if (transactionStr) {
                transaction = await (prisma as any).transaction.findFirst({
                    where: { mayarInvoiceId: transactionStr },
                    include: { user: true, course: true }
                });
            }
            if (!transaction && refId) {
                transaction = await (prisma as any).transaction.findUnique({
                    where: { id: refId },
                    include: { user: true, course: true }
                });
            }
        }

        // Assign matched ID for the Webhook Log
        if (transaction) {
            matchedTransactionId = transaction.id;
        } else if (subInvoice) {
            matchedTransactionId = subInvoice.id;
        }

        // 2. We only process status changes on payment.received
        if (eventName === "payment.received") {
            console.log(`[Webhook] Processing payment.received for ID: ${transactionStr} or refId: ${refId}`);

            if (subInvoice && subInvoice.status === "PENDING") {
                // Atomic lock: claim this invoice to prevent duplicate processing
                const lockResult = await prisma.subscriptionInvoice.updateMany({
                    where: { id: subInvoice.id, status: "PENDING" },
                    data: { status: "PAID", paidAt: new Date() }
                });
                if (lockResult.count === 0) {
                    console.log(`[Webhook] Subscription invoice ${subInvoice.id} already processed, skipping.`);
                } else {
                    // --- Handle Subscription Payment ---
                    const now = new Date();
                    const sub = subInvoice.subscription;

                    // Calculate new period ends 
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

                    // Fetch user data for the email
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
                // Atomic lock: claim this transaction to prevent duplicate processing
                const lockResult = await (prisma as any).transaction.updateMany({
                    where: { id: transaction.id, status: "PENDING" },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                        paymentMethod: eventData?.paymentMethod || eventData?.transaction?.paymentMethod || "unknown",
                        paymentChannel: eventData?.paymentChannel || eventData?.transaction?.paymentChannel || "unknown"
                    }
                });
                if (lockResult.count === 0) {
                    console.log(`[Webhook] Transaction ${transaction.id} already processed, skipping.`);
                } else {
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
        }

        // 5. Always log the webhook
        await prisma.webhookLog.create({
            data: {
                event: eventName,
                payload: body,
                httpStatus: 200,
                transactionId: matchedTransactionId || eventData?.referenceId || null
            }
        });

        // 5. Must return 200 OK fast so Mayar doesn't resend
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
