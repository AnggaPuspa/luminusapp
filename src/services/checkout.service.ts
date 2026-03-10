import prisma from "@/lib/prisma";
import { createMayarInvoice } from "@/lib/mayar";
import { sendPaymentSuccessEmail } from "@/lib/email";

// --- Types ---
export interface CheckoutInput {
    userId: string;
    userEmail: string;
    userName: string;
    courseId: string;
    couponCode?: string;
}

export interface CheckoutResult {
    isFree: boolean;
    redirectUrl?: string;
    paymentUrl?: string;
    transactionId: string;
}

// --- Pure Business Logic ---
export async function applyCoupon(couponCode: string, courseId: string, basePrice: number) {
    const coupon = await (prisma as any).coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
        return { discountAmount: 0, couponId: null };
    }

    const isValidDate = !coupon.validUntil || new Date() <= coupon.validUntil;
    const isValidLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
    const isValidCourse = !coupon.courseId || coupon.courseId === courseId;
    const isValidMinPurchase = !coupon.minPurchase || basePrice >= coupon.minPurchase;

    if (!isValidDate || !isValidLimit || !isValidCourse || !isValidMinPurchase) {
        return { discountAmount: 0, couponId: null };
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
        discountAmount = Math.floor(basePrice * (coupon.discountValue / 100));
    } else if (coupon.discountType === "FIXED") {
        discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, basePrice); // Prevent negative price
    return { discountAmount, couponId: coupon.id };
}

// --- Core Domain Function ---
export async function processCourseCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const { userId, userEmail, userName, courseId, couponCode } = input;

    // 1. Validate Course
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course || course.deletedAt || course.status !== "PUBLISHED") {
        throw new Error("COURSE_NOT_FOUND");
    }

    let finalPrice = course.discountedPrice !== null ? course.discountedPrice : course.originalPrice;
    let appliedCouponId: string | null = null;
    let discountAmount: number = 0;

    // 1.5 Handle Coupon if provided
    if (couponCode) {
        const couponResult = await applyCoupon(couponCode, courseId, finalPrice);
        discountAmount = couponResult.discountAmount;
        appliedCouponId = couponResult.couponId;
        finalPrice = finalPrice - discountAmount;
    }

    if (finalPrice > 0 && finalPrice < 500) {
        throw new Error("PRICE_TOO_LOW");
    }

    // 2. Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId: course.id,
            }
        }
    });

    if (existingEnrollment) {
        throw new Error("ALREADY_ENROLLED");
    }

    // 3. Create a PENDING transaction
    const transaction = await (prisma as any).transaction.create({
        data: {
            userId,
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
                    userId,
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
            userName,
            userEmail,
            course.title,
            0
        ).catch(err => console.error("Free Checkkout email error:", err));

        return {
            isFree: true,
            redirectUrl: `/kursus/${course.slug}/belajar`,
            transactionId: transaction.id
        };
    }

    // 4. Hit Mayar API to create Invoice/Payment Link
    const payloadToMayar = {
        name: userName,
        email: userEmail,
        amount: finalPrice,
        description: `Pembelian Kursus: ${course.title}`,
        mobile: "081234567890" // Mandatory for Mayar Hosted Checkout
    };

    let mayarResp;
    try {
        mayarResp = await createMayarInvoice(payloadToMayar);
    } catch (mErr: any) {
        console.error("MAYAR INVOICE ERROR:", mErr);
        throw new Error(`MAYAR_REJECTED`);
    }

    const paymentLink = mayarResp?.data?.link || mayarResp?.link;
    const invoiceId = mayarResp?.data?.id || mayarResp?.id;

    if (!paymentLink) {
        console.error("MAYAR SUCCESS BUT NO LINK:", mayarResp);
        throw new Error("MAYAR_NO_LINK");
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
    return {
        isFree: false,
        paymentUrl: paymentLink,
        transactionId: transaction.id
    };
}
