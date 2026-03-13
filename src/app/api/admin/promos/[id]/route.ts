import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, imageUrl, promoCode, ctaText, ctaUrl, startDate, endDate, isActive, priority } = body;

        const existing = await prisma.promoPopup.findUnique({
            where: { id: params.id }
        });

        if (!existing) {
            return NextResponse.json({ message: "Promo tidak ditemukan" }, { status: 404 });
        }

        const promo = await prisma.promoPopup.update({
            where: { id: params.id },
            data: {
                title: title ?? existing.title,
                description: description !== undefined ? description : existing.description,
                imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
                promoCode: promoCode !== undefined ? promoCode : existing.promoCode,
                ctaText: ctaText !== undefined ? ctaText : existing.ctaText,
                ctaUrl: ctaUrl !== undefined ? ctaUrl : existing.ctaUrl,
                startDate: startDate ? new Date(startDate) : existing.startDate,
                endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
                isActive: isActive ?? existing.isActive,
                priority: priority !== undefined ? parseInt(priority, 10) : existing.priority,
            }
        });

        return NextResponse.json({ message: "Promo berhasil diupdate", promo }, { status: 200 });
    } catch (error: any) {
        console.error("Failed to update promo:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await prisma.promoPopup.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Promo berhasil dihapus" }, { status: 200 });
    } catch (error: any) {
        console.error("Failed to delete promo:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
