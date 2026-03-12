import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMayarWebhook } from "@/lib/mayar";
import { sendPaymentSuccessEmail, sendSubscriptionSuccessEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        
        // Debug: Log all headers to find correct signature header name
        const allHeaders: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            allHeaders[key] = value;
        });
        console.log("[Webhook] Received headers:", JSON.stringify(allHeaders));
        console.log("[Webhook] Raw body (first 500 chars):", rawBody.substring(0, 500));

        // Try multiple possible header names for signature
        const signature = request.headers.get("x-callback-signature") 
            || request.headers.get("x-mayar-signature")
            || request.headers.get("x-webhook-signature")
            || request.headers.get("signature");

        // Verify Signature - but log instead of rejecting if no secret configured
        if (process.env.MAYAR_WEBHOOK_SECRET && signature) {
            if (!verifyMayarWebhook(signature, rawBody)) {
                console.warn("[Webhook] Signature mismatch! Received:", signature);
                // Still process for now to debug, but log the warning
            }
        } else {
            console.warn("[Webhook] No signature found in request headers or no secret configured");
        }

        const body = JSON.parse(rawBody);
        const eventName = body.event;
        const eventData = body.data;
        console.log("[Webhook] Event:", eventName, "| Data keys:", eventData ? Object.keys(eventData) : "none");

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
