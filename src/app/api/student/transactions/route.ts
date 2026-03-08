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

        // Fetch both course transactions AND subscription invoices
        const [courseTransactions, subscriptionInvoices] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId },
                include: {
                    course: {
                        select: { title: true, thumbnailUrl: true }
                    }
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.subscriptionInvoice.findMany({
                where: {
                    subscription: { userId }
                },
                include: {
                    subscription: {
                        include: {
                            plan: {
                                select: { name: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
            })
        ]);

        // Normalize course transactions
        const normalizedCourse = courseTransactions.map((tx: any) => ({
            id: tx.id,
            type: "COURSE" as const,
            title: tx.course?.title || "Kelas",
            thumbnailUrl: tx.course?.thumbnailUrl || null,
            subtitle: "Pembelian Kelas",
            amount: tx.amount,
            status: tx.status,
            createdAt: tx.createdAt,
            mayarInvoiceUrl: tx.mayarInvoiceUrl || null,
        }));

        // Normalize subscription invoices
        const normalizedSub = subscriptionInvoices.map((inv: any) => ({
            id: inv.id,
            type: "SUBSCRIPTION" as const,
            title: inv.subscription?.plan?.name || "Langganan",
            thumbnailUrl: null,
            subtitle: "Langganan Bulanan",
            amount: inv.amount,
            status: inv.status, // PENDING, PAID, FAILED
            createdAt: inv.createdAt,
            mayarInvoiceUrl: inv.mayarInvoiceUrl || null,
        }));

        // Merge and sort by date descending
        const merged = [...normalizedCourse, ...normalizedSub]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(merged, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student transactions:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
