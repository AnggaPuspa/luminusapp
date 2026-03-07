import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMayarWebhook } from "@/lib/mayar";

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
            // Find transaction by Mayar Invoice ID or Reference ID
            // Make sure the transaction exists and is currently PENDING
            const transactionStr = eventData?.transaction?.id || eventData?.id;
            // NOTE: The exact payload mapping (data.id vs data.transaction.id) 
            // depends on Mayar's exact JSON structure for payment.received. 
            // We'll search our DB by mayarInvoiceId first.

            let transaction = await prisma.transaction.findFirst({
                where: { mayarInvoiceId: transactionStr }
            });

            // If we don't find it by mayarInvoiceId, let's try the referenceId if Mayar returns it
            if (!transaction && eventData?.referenceId) {
                transaction = await prisma.transaction.findUnique({
                    where: { id: eventData.referenceId }
                });
            }

            if (transaction && transaction.status === "PENDING") {
                // 3. Update Transaction and Create Enrollment securely in a transaction
                await prisma.$transaction([
                    prisma.transaction.update({
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
                        update: { status: "ACTIVE" },
                        create: {
                            userId: transaction.userId,
                            courseId: transaction.courseId,
                            status: "ACTIVE"
                        }
                    })
                ]);
            }
        }

        // 4. Always log the webhook
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
