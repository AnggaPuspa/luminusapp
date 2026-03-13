import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

        const expired = await prisma.transaction.updateMany({
            where: {
                status: "PENDING",
                createdAt: { lt: cutoff }
            },
            data: { status: "EXPIRED" }
        });

        console.log(`[Cron] Expired ${expired.count} stale PENDING transactions.`);

        return NextResponse.json({
            success: true,
            expiredCount: expired.count
        });

    } catch (error: any) {
        console.error("Cron Error (expire-transactions):", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
