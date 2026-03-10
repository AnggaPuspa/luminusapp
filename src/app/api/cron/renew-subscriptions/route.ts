import { NextResponse } from "next/server";
import { processSubscriptionRenewal } from "@/services/subscription.service";

export async function GET(request: Request) {
    try {
        // 1. Verify Vercel Cron Secret (or custom secret for local testing)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const result = await processSubscriptionRenewal();

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Cron Error (renew-subscriptions):", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
