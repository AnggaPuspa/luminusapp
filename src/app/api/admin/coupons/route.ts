import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const coupons = await (prisma as any).coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(coupons, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch coupons:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const body = await request.json();
        const { code, discountType, discountValue, maxUses, minPurchase, validUntil, isActive, courseId } = body;

        if (!code || !discountType || discountValue == null) {
            return NextResponse.json({ message: "Code, Type, and Value are required" }, { status: 400 });
        }

        const existing = await (prisma as any).coupon.findUnique({ where: { code } });
        if (existing) {
            return NextResponse.json({ message: "Kode kupon sudah terdaftar" }, { status: 400 });
        }

        const coupon = await (prisma as any).coupon.create({
            data: {
                code: code.toUpperCase(),
                discountType,
                discountValue,
                maxUses: maxUses ? parseInt(maxUses) : null,
                minPurchase: minPurchase ? parseInt(minPurchase) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
                isActive: isActive ?? true,
                courseId: courseId || null,
            }
        });

        return NextResponse.json({ message: "Kupon berhasil dibuat", coupon }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create coupon:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
