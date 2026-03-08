import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const subscribers = await prisma.userSubscription.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                plan: {
                    select: { id: true, name: true, tier: true, aiMentorQuota: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(subscribers);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch subscribers" },
            { status: 500 }
        );
    }
}
