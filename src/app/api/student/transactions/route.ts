import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
            },
            include: {
                course: {
                    select: {
                        title: true,
                        thumbnailUrl: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(transactions, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student transactions:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
