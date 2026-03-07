import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized. Please log in first." }, { status: 401 });
        }

        const body = await request.json();
        const { code, courseId } = body;

        if (!code || !courseId) {
            return NextResponse.json({ message: "Coupon code and course ID are required" }, { status: 400 });
        }

        // 1. Fetch Course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        // 2. Fetch Coupon
        const coupon = await (prisma as any).coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return NextResponse.json({ message: "Kupon tidak ditemukan" }, { status: 404 });
        }

        // 3. Validation Rules
        if (!coupon.isActive) {
            return NextResponse.json({ message: "Kupon sudah tidak aktif" }, { status: 400 });
        }

        if (coupon.validUntil && new Date() > coupon.validUntil) {
            return NextResponse.json({ message: "Masa berlaku kupon sudah habis" }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ message: "Kuota kupon sudah habis digunakan" }, { status: 400 });
        }

        if (coupon.courseId && coupon.courseId !== courseId) {
            return NextResponse.json({ message: "Kupon tidak berlaku untuk kelas ini" }, { status: 400 });
        }

        const originalPrice = course.discountedPrice !== null ? course.discountedPrice : course.originalPrice;

        if (coupon.minPurchase && originalPrice < coupon.minPurchase) {
            return NextResponse.json({ message: `Kupon hanya berlaku untuk minimal pembelian Rp ${(coupon.minPurchase as number).toLocaleString('id-ID')}` }, { status: 400 });
        }

        // 4. Calculate Discount
        let discountAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = Math.floor(originalPrice * (coupon.discountValue / 100));
        } else if (coupon.discountType === "FIXED") {
            discountAmount = coupon.discountValue;
        }

        // Ensure we don't discount more than the actual price
        discountAmount = Math.min(discountAmount, originalPrice);

        const finalPrice = originalPrice - discountAmount;

        return NextResponse.json({
            message: "Kupon berhasil diterapkan",
            originalPrice,
            discountAmount,
            finalPrice,
            couponId: coupon.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to validate coupon:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
