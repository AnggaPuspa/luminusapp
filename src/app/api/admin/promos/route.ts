import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const promos = await prisma.promoPopup.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(promos, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch promos:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, imageUrl, promoCode, ctaText, ctaUrl, startDate, endDate, isActive, priority } = body;

        if (!title) {
            return NextResponse.json({ message: "Judul promo wajib diisi" }, { status: 400 });
        }

        const promo = await prisma.promoPopup.create({
            data: {
                title,
                description: description || null,
                imageUrl: imageUrl || null,
                promoCode: promoCode || null,
                ctaText: ctaText || null,
                ctaUrl: ctaUrl || null,
                startDate: new Date(startDate || new Date()),
                endDate: endDate ? new Date(endDate) : null,
                isActive: isActive ?? true,
                priority: priority ? parseInt(priority, 10) : 0,
            }
        });

        return NextResponse.json({ message: "Promo berhasil dibuat", promo }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create promo:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
