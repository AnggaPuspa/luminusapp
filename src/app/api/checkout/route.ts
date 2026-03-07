import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { createMayarInvoice } from "@/lib/mayar";
import { sendPaymentSuccessEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized. Please log in first." }, { status: 401 });
        }

        const body = await request.json();
        const { courseId, couponCode } = body;

        if (!courseId) {
            return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
        }

        // 1. Validate Course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course || course.deletedAt || course.status !== "PUBLISHED") {
            return NextResponse.json({ message: "Course not found or unavailable" }, { status: 404 });
        }

        let finalPrice = course.discountedPrice !== null ? course.discountedPrice : course.originalPrice;
        let appliedCouponId: string | null = null;
        let discountAmount: number = 0;

        // 1.5 Handle Coupon if provided
        if (couponCode) {
            const coupon = await (prisma as any).coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });

            if (coupon && coupon.isActive) {
                // Check valid details
                const isValidDate = !coupon.validUntil || new Date() <= coupon.validUntil;
                const isValidLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
                const isValidCourse = !coupon.courseId || coupon.courseId === courseId;
                const isValidMinPurchase = !coupon.minPurchase || finalPrice >= coupon.minPurchase;

                if (isValidDate && isValidLimit && isValidCourse && isValidMinPurchase) {
                    if (coupon.discountType === "PERCENTAGE") {
                        discountAmount = Math.floor(finalPrice * (coupon.discountValue / 100));
                    } else if (coupon.discountType === "FIXED") {
                        discountAmount = coupon.discountValue;
                    }

                    discountAmount = Math.min(discountAmount, finalPrice); // Prevent negative price
                    finalPrice = finalPrice - discountAmount;
                    appliedCouponId = coupon.id;
                }
            }
        }

        if (finalPrice > 0 && finalPrice < 500) {
            return NextResponse.json({ message: "Harga kursus terlalu rendah. Minimum transaksi Mayar adalah Rp 500." }, { status: 400 });
        }

        // 2. Check if user is already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: course.id,
                }
            }
        });

        if (existingEnrollment) {
            return NextResponse.json({ message: "You are already enrolled in this course." }, { status: 400 });
        }

        // 3. Create a PENDING transaction
        const transaction = await (prisma as any).transaction.create({
            data: {
                userId: session.user.id,
                courseId: course.id,
                amount: finalPrice,
                status: "PENDING",
                couponId: appliedCouponId,
                discountAmount: discountAmount > 0 ? discountAmount : null
            }
        });

        // If price is 0 (Free Course), we just auto-enroll them without hitting Mayar
        if (finalPrice === 0) {
            const txns: any[] = [
                prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: "PAID", paidAt: new Date() }
                }),
                prisma.enrollment.create({
                    data: {
                        userId: session.user.id,
                        courseId: course.id,
                    }
                })
            ];

            if (appliedCouponId) {
                txns.push(
                    (prisma as any).coupon.update({
                        where: { id: appliedCouponId },
                        data: { usedCount: { increment: 1 } }
                    })
                );
            }

            await prisma.$transaction(txns);

            sendPaymentSuccessEmail(
                session.user.name || "Student",
                session.user.email,
                course.title,
                0
            ).catch(err => console.error("Free Checkkout email error:", err));

            return NextResponse.json({
                message: "Course is free. Successfully enrolled.",
                isFree: true,
                redirectUrl: `/kursus/${course.slug}/belajar`
            }, { status: 200 });
        }

        // 4. Hit Mayar API to create Invoice/Payment Link
        const customerName = session.user.name || "Student";
        const payloadToMayar = {
            name: customerName,
            email: session.user.email,
            amount: finalPrice,
            description: `Pembelian Kursus: ${course.title}`,
            mobile: "081234567890" // Mandatory for Mayar Hosted Checkout
        };

        console.log("---- MAYAR PAYLOAD CHECK ----");
        console.log(JSON.stringify(payloadToMayar, null, 2));

        let mayarResp;
        try {
            mayarResp = await createMayarInvoice(payloadToMayar);
        } catch (mErr: any) {
            console.error("MAYAR INVOICE ERROR:", mErr);
            throw new Error(`MAYAR REJECTED: ${mErr.message}`);
        }

        // Note: Mayar's response payload structure might differ (e.g., data.link vs link)
        // We assume standard `{ data: { link: '...', id: '...' } }` or similar. Adjust as needed.
        const paymentLink = mayarResp?.data?.link || mayarResp?.link;
        const invoiceId = mayarResp?.data?.id || mayarResp?.id;

        if (!paymentLink) {
            console.error("MAYAR SUCCESS BUT NO LINK:", mayarResp);
            throw new Error("Failed to get payment link from Mayar");
        }

        // 5. Update Transaction with Mayar Details
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                mayarInvoiceId: invoiceId?.toString(),
                mayarInvoiceUrl: paymentLink
            }
        });

        // 6. Return paymentUrl to Redirect user
        return NextResponse.json({
            paymentUrl: paymentLink,
            transactionId: transaction.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Checkout API Error:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
