import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        // Check if user is logged in AND is an ADMIN
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized accesses. Admin only." }, { status: 401 });
        }

        // Fetch recent transactions with relations
        const transactions = await prisma.transaction.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        return NextResponse.json(transactions, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch transactions:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
