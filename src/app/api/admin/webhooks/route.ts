import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        // Check if user is logged in AND is an ADMIN
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized accesses. Admin only." }, { status: 401 });
        }

        // Fetch recent webhook logs
        const webhooks = await prisma.webhookLog.findMany({
            orderBy: {
                receivedAt: "desc",
            },
            take: 100, // Limit to 100 most recent for performance
            include: {
                transaction: {
                    select: { mayarInvoiceId: true }
                }
            }
        });

        return NextResponse.json(webhooks, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch webhooks:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
