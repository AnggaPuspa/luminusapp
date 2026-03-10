import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { processSubscriptionCheckout } from "@/services/subscription.service";

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

        const result = await processSubscriptionCheckout({
            userId: session.user.id,
            userEmail: session.user.email,
            userName: session.user.name || "Student",
            planId,
            cycle,
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error("Subscription Checkout API Error:", error);

        const statusMap: Record<string, number> = {
            PLAN_NOT_FOUND: 404,
            PRICE_TOO_LOW: 400,
            ALREADY_SUBSCRIBED: 400,
            MAYAR_NO_LINK: 502,
            MAYAR_REJECTED: 502,
        };

        const status = statusMap[error.message] || 500;

        const messageMap: Record<string, string> = {
            PLAN_NOT_FOUND: "Subscription plan not found or is currently inactive",
            PRICE_TOO_LOW: "Harga langganan terlalu rendah. Minimum transaksi Mayar adalah Rp 500.",
            ALREADY_SUBSCRIBED: "You already have an active subscription. Please manage it in your dashboard.",
        };

        const message = messageMap[error.message] || error.message || "Internal Server Error";

        return NextResponse.json({ message }, { status });
    }
}
