import prisma from "@/lib/prisma";
import { snap } from "@/lib/midtrans";

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

    // 0. Fetch User to get phone number
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
    });
    
    const mobileNumber = user?.phoneNumber || "0000000000";

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

    // 5. Hit Midtrans API
    const parameter = {
        transaction_details: {
            order_id: invoice.id,
            gross_amount: amount
        },
        customer_details: {
            first_name: userName,
            email: userEmail,
            phone: mobileNumber
        },
        item_details: [{
            id: plan.id,
            price: amount,
            quantity: 1,
            name: `Langganan Luminus - ${plan.name} (${cycle})`.substring(0, 50)
        }]
    };

    let midtransResp;
    try {
        midtransResp = await snap.createTransaction(parameter);
    } catch (mErr: any) {
        await prisma.userSubscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED" } });
        await prisma.subscriptionInvoice.update({ where: { id: invoice.id }, data: { status: "FAILED", failureReason: mErr.message } });
        throw new Error(`MIDTRANS_REJECTED`);
    }

    const paymentLink = midtransResp.redirect_url;
    const paymentToken = midtransResp.token;

    if (!paymentLink) {
        await prisma.userSubscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED" } });
        await prisma.subscriptionInvoice.update({ where: { id: invoice.id }, data: { status: "FAILED", failureReason: "Midtrans response has no payment link" } });
        throw new Error("MIDTRANS_NO_LINK");
    }

    // 6. Save Midtrans details
    await prisma.subscriptionInvoice.update({
        where: { id: invoice.id },
        data: {
            paymentToken: paymentToken,
            paymentUrl: paymentLink
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
        let invoice: any = null;
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

            invoice = await prisma.subscriptionInvoice.create({
                data: {
                    subscriptionId: sub.id,
                    amount: amount,
                    status: "PENDING",
                    billingPeriodStart: pStart,
                    billingPeriodEnd: pEnd,
                }
            });

            const parameter = {
                transaction_details: {
                    order_id: invoice.id,
                    gross_amount: amount
                },
                customer_details: {
                    first_name: sub.user.name || "Student",
                    email: sub.user.email,
                    phone: sub.user.phoneNumber || "0000000000"
                },
                item_details: [{
                    id: sub.plan.id,
                    price: amount,
                    quantity: 1,
                    name: `Perpanjangan Luminus - ${sub.plan.name} (${sub.billingCycle})`.substring(0, 50)
                }]
            };

            const midtransResp = await snap.createTransaction(parameter);
            const paymentLink = midtransResp.redirect_url;
            const paymentToken = midtransResp.token;

            if (paymentLink && paymentToken) {
                await prisma.subscriptionInvoice.update({
                    where: { id: invoice.id },
                    data: { paymentUrl: paymentLink, paymentToken: paymentToken }
                });

                results.push({ subId: sub.id, success: true, invoiceId: invoice.id });
            } else {
                throw new Error("Midtrans didn't return a link");
            }

        } catch (err: any) {
            console.error(`Error renewing sub ${sub.id}:`, err);
            // Cleanup orphaned invoice
            if (invoice) {
                await prisma.subscriptionInvoice.update({
                    where: { id: invoice.id },
                    data: { status: "FAILED", failureReason: err.message }
                }).catch(cleanupErr => console.error(`Failed to cleanup invoice:`, cleanupErr));
            }
            results.push({ subId: sub.id, success: false, error: err.message });
        }
    }

    return { success: true, processed: subsToRenew.length, details: results };
}
