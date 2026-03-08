import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { createMayarInvoice } from "@/lib/mayar";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized. Please log in first." }, { status: 401 });
        }

        const body = await request.json();
        const { planId, cycle } = body;

        if (!planId || !["MONTHLY", "YEARLY"].includes(cycle)) {
            return NextResponse.json({ message: "Valid planId and cycle (MONTHLY/YEARLY) are required" }, { status: 400 });
        }

        // 1. Validate Plan
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan || !plan.isActive) {
            return NextResponse.json({ message: "Subscription plan not found or is currently inactive" }, { status: 404 });
        }

        const amount = cycle === "YEARLY" && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice;

        if (amount < 500) {
            return NextResponse.json({ message: "Harga langganan terlalu rendah. Minimum transaksi Mayar adalah Rp 500." }, { status: 400 });
        }

        // 2. Check if user already has an active subscription
        // For MVP, block new subscription if they already have one. Prerequisite: they must let the old one expire or be canceled.
        const existingSub = await prisma.userSubscription.findFirst({
            where: {
                userId: session.user.id,
                status: { in: ["ACTIVE", "PENDING"] },
            }
        });

        if (existingSub) {
            return NextResponse.json({ message: "You already have an active subscription. Please manage it in your dashboard." }, { status: 400 });
        }

        // 3. Setup Initial Period dates (Temporary, will be updated to actual upon webhook success)
        const now = new Date();
        const tempEnd = new Date(now);
        if (cycle === "YEARLY") {
            tempEnd.setFullYear(tempEnd.getFullYear() + 1);
        } else {
            tempEnd.setMonth(tempEnd.getMonth() + 1);
        }

        // 4. Wrap database creation in a transaction to ensure integrity
        const { subscription, invoice } = await prisma.$transaction(async (tx: any) => {
            // Create pending subscription
            const sub = await tx.userSubscription.create({
                data: {
                    userId: session.user.id,
                    planId: plan.id,
                    status: "PENDING",
                    billingCycle: cycle,
                    currentPeriodStart: now,
                    currentPeriodEnd: tempEnd, // Will be overridden in webhook
                }
            });

            // Create pending invoice linked to subscription
            const inv = await tx.subscriptionInvoice.create({
                data: {
                    subscriptionId: sub.id,
                    amount: amount,
                    status: "PENDING",
                    billingPeriodStart: now,
                    billingPeriodEnd: tempEnd, // Will be overridden in webhook
                }
            });

            return { subscription: sub, invoice: inv };
        });

        // 5. Hit Mayar API to create Custom Payment Link
        const customerName = session.user.name || "Student";
        const payloadToMayar = {
            name: customerName,
            email: session.user.email,
            amount: amount,
            description: `Langganan Luminus - ${plan.name} (${cycle})`,
            mobile: "081234567890" // Mandatory for Mayar Hosted Checkout, could solicit from user profile in future
        };

        let mayarResp;
        try {
            mayarResp = await createMayarInvoice(payloadToMayar);
        } catch (mErr: any) {
            // Rollback if the external payment provider fails 
            // We'll mark them as failed immediately to clean up state
            await prisma.userSubscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED" } });
            await prisma.subscriptionInvoice.update({ where: { id: invoice.id }, data: { status: "FAILED", failureReason: mErr.message } });
            throw new Error(`MAYAR REJECTED: ${mErr.message}`);
        }

        const paymentLink = mayarResp?.data?.link || mayarResp?.link;
        const mayarId = mayarResp?.data?.id || mayarResp?.id;

        if (!paymentLink) {
            throw new Error("Failed to get payment link from Mayar");
        }

        // 6. Save Mayar details to the Invoice
        await prisma.subscriptionInvoice.update({
            where: { id: invoice.id },
            data: {
                mayarInvoiceId: mayarId?.toString(),
                mayarInvoiceUrl: paymentLink
            }
        });

        return NextResponse.json({
            paymentUrl: paymentLink,
            invoiceId: invoice.id,
            subscriptionId: subscription.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Subscription Checkout API Error:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
