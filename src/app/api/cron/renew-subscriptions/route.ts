import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createMayarInvoice } from "@/lib/mayar";

export async function GET(request: Request) {
    try {
        // 1. Verify Vercel Cron Secret (or custom secret for local testing)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 2. Find ACTIVE subscriptions that expire between now and tomorrow
        const subsToRenew = await prisma.userSubscription.findMany({
            where: {
                status: "ACTIVE",
                currentPeriodEnd: {
                    gte: now,
                    lte: tomorrow
                }
            },
            include: { plan: true, user: true }
        });

        const results = [];

        for (const sub of subsToRenew) {
            try {
                // Check if a PENDING invoice already exists for this period to avoid duplicates
                const existingInvoice = await prisma.subscriptionInvoice.findFirst({
                    where: {
                        subscriptionId: sub.id,
                        status: "PENDING",
                        billingPeriodStart: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                });

                if (existingInvoice) {
                    results.push({ subId: sub.id, skipped: true, reason: "Pending invoice already exists" });
                    continue;
                }

                // Calculate next period dates
                const pStart = sub.currentPeriodEnd;
                const pEnd = new Date(pStart);
                if (sub.billingCycle === "YEARLY") pEnd.setFullYear(pEnd.getFullYear() + 1);
                else pEnd.setMonth(pEnd.getMonth() + 1);

                const amount = sub.billingCycle === "YEARLY" && sub.plan.yearlyPrice
                    ? sub.plan.yearlyPrice
                    : sub.plan.monthlyPrice;

                // Create Pending Invoice
                const invoice = await prisma.subscriptionInvoice.create({
                    data: {
                        subscriptionId: sub.id,
                        amount: amount,
                        status: "PENDING",
                        billingPeriodStart: pStart,
                        billingPeriodEnd: pEnd,
                    }
                });

                // Generate Mayar Link
                const payloadToMayar = {
                    name: sub.user.name || "Student",
                    email: sub.user.email,
                    amount: amount,
                    description: `Perpanjangan Luminus - ${sub.plan.name} (${sub.billingCycle})`,
                    mobile: "081234567890"
                };

                const mayarResp = await createMayarInvoice(payloadToMayar);
                const paymentLink = mayarResp?.data?.link || mayarResp?.link;
                const mayarId = mayarResp?.data?.id || mayarResp?.id;

                if (paymentLink && mayarId) {
                    await prisma.subscriptionInvoice.update({
                        where: { id: invoice.id },
                        data: { mayarInvoiceUrl: paymentLink, mayarInvoiceId: mayarId.toString() }
                    });

                    // TODO: Send Email to user with the paymentLink
                    // sendRenewalEmail(sub.user.email, paymentLink, amount, pEnd);

                    results.push({ subId: sub.id, success: true, invoiceId: invoice.id });
                } else {
                    throw new Error("Mayar didn't return a link");
                }

            } catch (err: any) {
                console.error(`Error renewing sub ${sub.id}:`, err);
                results.push({ subId: sub.id, success: false, error: err.message });
            }
        }

        return NextResponse.json({ success: true, processed: subsToRenew.length, details: results });

    } catch (error: any) {
        console.error("Cron Error (renew-subscriptions):", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
