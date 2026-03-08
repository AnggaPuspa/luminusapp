import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMayarWebhook } from "@/lib/mayar";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const signature = request.headers.get("x-mayar-signature"); // Adjust header name based on exact Mayar docs
        const rawBody = await request.text();

        // 1. Verify Signature
        if (!signature || !verifyMayarWebhook(signature, rawBody)) {
            console.error("Invalid or missing Webhook Signature");
            return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody);
        const eventName = body.event;
        const eventData = body.data;

        // 2. We only care about payment.received for now
        if (eventName === "payment.received") {
            const transactionStr = eventData?.transaction?.id || eventData?.id;
            const refId = eventData?.referenceId;

            // FIRST: Check if this payment is for a Subscription Invoice
            let subInvoice = await prisma.subscriptionInvoice.findFirst({
                where: { mayarInvoiceId: transactionStr },
                include: { subscription: true }
            });

            if (!subInvoice && refId) {
                subInvoice = await prisma.subscriptionInvoice.findFirst({
                    where: { id: refId },
                    include: { subscription: true }
                });
            }

            if (subInvoice && subInvoice.status === "PENDING") {
                // --- Handle Subscription Payment ---
                const now = new Date();
                const sub = subInvoice.subscription;

                // Calculate new period ends 
                let newStart = sub.currentPeriodStart;
                let newEnd = sub.currentPeriodEnd;

                // If subscription was inactive or expired, reset the start date to now
                if (sub.status !== "ACTIVE" || sub.currentPeriodEnd < now) {
                    newStart = now;
                    newEnd = new Date(now);
                    if (sub.billingCycle === "YEARLY") newEnd.setFullYear(newEnd.getFullYear() + 1);
                    else newEnd.setMonth(newEnd.getMonth() + 1);
                } else {
                    // It's an active renewal (paid before expiration), just extend the end date
                    newEnd = new Date(sub.currentPeriodEnd);
                    if (sub.billingCycle === "YEARLY") newEnd.setFullYear(newEnd.getFullYear() + 1);
                    else newEnd.setMonth(newEnd.getMonth() + 1);
                }

                await prisma.$transaction([
                    prisma.subscriptionInvoice.update({
                        where: { id: subInvoice.id },
                        data: { status: "PAID", paidAt: now }
                    }),
                    prisma.userSubscription.update({
                        where: { id: sub.id },
                        data: {
                            status: "ACTIVE",
                            currentPeriodStart: newStart,
                            currentPeriodEnd: newEnd,
                            // NOTE: aiChatUsedThisMonth NOT reset here — only via cron reset-ai-quota on 1st of month
                        }
                    })
                ]);

                // TODO: We could send a "Subscription Activated/Renewed" email here
                console.log(`[Webhook] Subscription ${sub.id} activated/renewed successfully.`);
            } else {
                // SECOND: If not a subscription, process as One-Time Transaction
                let transaction = await (prisma as any).transaction.findFirst({
                    where: { mayarInvoiceId: transactionStr },
                    include: { user: true, course: true }
                });

                if (!transaction && refId) {
                    transaction = await (prisma as any).transaction.findUnique({
                        where: { id: refId },
                        include: { user: true, course: true }
                    });
                }

                if (transaction && transaction.status === "PENDING") {
                    const dbOps: any[] = [
                        (prisma as any).transaction.update({
                            where: { id: transaction.id },
                            data: {
                                status: "PAID",
                                paidAt: new Date(),
                                paymentMethod: eventData?.paymentMethod || eventData?.transaction?.paymentMethod || "unknown",
                                paymentChannel: eventData?.paymentChannel || eventData?.transaction?.paymentChannel || "unknown"
                            }
                        }),
                        prisma.enrollment.upsert({
                            where: {
                                userId_courseId: {
                                    userId: transaction.userId,
                                    courseId: transaction.courseId
                                }
                            },
                            update: { status: "ACTIVE", source: "PURCHASE" }, // Upgrade ke lifetime jika sebelumnya via subscription
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
                transactionId: eventData?.referenceId || null // Best effort linking
            }
        });

        // 5. Must return 200 OK fast so Mayar doesn't resend
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
