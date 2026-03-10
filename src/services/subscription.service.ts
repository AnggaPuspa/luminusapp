import prisma from "@/lib/prisma";
import { createMayarInvoice } from "@/lib/mayar";

export interface SubscriptionInput {
    userId: string;
    userEmail: string;
    userName: string;
    planId: string;
    cycle: "MONTHLY" | "YEARLY";
}

export interface SubscriptionResult {
    paymentUrl?: string;
    invoiceId: string;
    subscriptionId: string;
}

export async function processSubscriptionCheckout(input: SubscriptionInput): Promise<SubscriptionResult> {
    const { userId, userEmail, userName, planId, cycle } = input;

    // 1. Validate Plan
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
    });

    if (!plan || !plan.isActive) {
        throw new Error("PLAN_NOT_FOUND");
    }

    const amount = cycle === "YEARLY" && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice;

    if (amount < 500) {
        throw new Error("PRICE_TOO_LOW");
    }

    // 2. Check if user already has an active subscription
    const existingSub = await prisma.userSubscription.findFirst({
        where: {
            userId,
            status: { in: ["ACTIVE", "PENDING"] },
        }
    });

    if (existingSub) {
        throw new Error("ALREADY_SUBSCRIBED");
    }

    // 3. Setup Initial Period dates
    const now = new Date();
    const tempEnd = new Date(now);
    if (cycle === "YEARLY") {
        tempEnd.setFullYear(tempEnd.getFullYear() + 1);
    } else {
        tempEnd.setMonth(tempEnd.getMonth() + 1);
    }

    // 4. Wrap database creation in a transaction
    const { subscription, invoice } = await prisma.$transaction(async (tx: any) => {
        const sub = await tx.userSubscription.create({
            data: {
                userId,
                planId: plan.id,
                status: "PENDING",
                billingCycle: cycle,
                currentPeriodStart: now,
                currentPeriodEnd: tempEnd,
            }
        });

        const inv = await tx.subscriptionInvoice.create({
            data: {
                subscriptionId: sub.id,
                amount: amount,
                status: "PENDING",
                billingPeriodStart: now,
                billingPeriodEnd: tempEnd,
            }
        });

        return { subscription: sub, invoice: inv };
    });

    // 5. Hit Mayar API
    const payloadToMayar = {
        name: userName,
        email: userEmail,
        amount: amount,
        description: `Langganan Luminus - ${plan.name} (${cycle})`,
        mobile: "081234567890"
    };

    let mayarResp;
    try {
        mayarResp = await createMayarInvoice(payloadToMayar);
    } catch (mErr: any) {
        await prisma.userSubscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED" } });
        await prisma.subscriptionInvoice.update({ where: { id: invoice.id }, data: { status: "FAILED", failureReason: mErr.message } });
        throw new Error(`MAYAR_REJECTED`);
    }

    const paymentLink = mayarResp?.data?.link || mayarResp?.link;
    const mayarId = mayarResp?.data?.id || mayarResp?.id;

    if (!paymentLink) {
        throw new Error("MAYAR_NO_LINK");
    }

    // 6. Save Mayar details
    await prisma.subscriptionInvoice.update({
        where: { id: invoice.id },
        data: {
            mayarInvoiceId: mayarId?.toString(),
            mayarInvoiceUrl: paymentLink
        }
    });

    return {
        paymentUrl: paymentLink,
        invoiceId: invoice.id,
        subscriptionId: subscription.id
    };
}

export async function processSubscriptionRenewal(): Promise<{ success: boolean; processed: number; details: any[] }> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

            const pStart = sub.currentPeriodEnd;
            const pEnd = new Date(pStart);
            if (sub.billingCycle === "YEARLY") pEnd.setFullYear(pEnd.getFullYear() + 1);
            else pEnd.setMonth(pEnd.getMonth() + 1);

            const amount = sub.billingCycle === "YEARLY" && sub.plan.yearlyPrice
                ? sub.plan.yearlyPrice
                : sub.plan.monthlyPrice;

            const invoice = await prisma.subscriptionInvoice.create({
                data: {
                    subscriptionId: sub.id,
                    amount: amount,
                    status: "PENDING",
                    billingPeriodStart: pStart,
                    billingPeriodEnd: pEnd,
                }
            });

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

                results.push({ subId: sub.id, success: true, invoiceId: invoice.id });
            } else {
                throw new Error("Mayar didn't return a link");
            }

        } catch (err: any) {
            console.error(`Error renewing sub ${sub.id}:`, err);
            results.push({ subId: sub.id, success: false, error: err.message });
        }
    }

    return { success: true, processed: subsToRenew.length, details: results };
}
