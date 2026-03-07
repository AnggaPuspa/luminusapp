import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const session = await verifySession();
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const body = await request.json();
        const { code, discountType, discountValue, maxUses, minPurchase, validUntil, isActive, courseId } = body;

        const coupon = await (prisma as any).coupon.update({
            where: { id },
            data: {
                code: code ? code.toUpperCase() : undefined,
                discountType,
                discountValue,
                maxUses: maxUses !== undefined ? maxUses : null,
                minPurchase: minPurchase !== undefined ? minPurchase : null,
                validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : undefined,
                isActive,
                courseId: courseId !== undefined ? (courseId || null) : undefined,
            }
        });

        return NextResponse.json({ message: "Kupon berhasil diupdate", coupon }, { status: 200 });
    } catch (error: any) {
        console.error("Failed to update coupon:", error);
        return NextResponse.json({ message: "Gagal memperbarui kupon" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const session = await verifySession();
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const txCount = await (prisma as any).transaction.count({
            where: { couponId: id }
        });

        if (txCount > 0) {
            await (prisma as any).coupon.update({
                where: { id },
                data: { isActive: false }
            });
            return NextResponse.json({ message: "Kupon telah dinonaktifkan karena sudah pernah digunakan." }, { status: 200 });
        }

        await (prisma as any).coupon.delete({ where: { id } });

        return NextResponse.json({ message: "Kupon berhasil dihapus permanen" }, { status: 200 });
    } catch (error: any) {
        console.error("Failed to delete coupon:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
