import prisma from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
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

    // 0. Fetch fresh user data from DB (not session, which can be stale)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phoneNumber: true }
    });
    
    const freshName = user?.name || userName;
    const freshEmail = user?.email || userEmail;
    const mobileNumber = user?.phoneNumber || "0000000000";

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
        if (couponResult.couponId === null) {
            throw new Error("COUPON_INVALID");
        }
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

    // 2.5 Guard against duplicate PENDING transactions (race condition)
    const existingPending = await (prisma as any).transaction.findFirst({
        where: {
            userId,
            courseId: course.id,
            status: "PENDING",
            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
    });
    if (existingPending) {
        if (existingPending.paymentUrl) {
            return {
                isFree: false,
                paymentUrl: existingPending.paymentUrl,
                transactionId: existingPending.id
            };
        }
        // Stale PENDING without link — mark failed and continue
        await prisma.transaction.update({
            where: { id: existingPending.id },
            data: { status: "FAILED" }
        });
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
            freshName,
            freshEmail,
            course.title,
            0
        ).catch(err => console.error("Free Checkkout email error:", err));

        return {
            isFree: true,
            redirectUrl: `/kursus/${course.slug}/belajar`,
            transactionId: transaction.id
        };
    }

    // 4. Hit Midtrans Snap API
    const parameter = {
        transaction_details: {
            order_id: transaction.id,
            gross_amount: finalPrice
        },
        customer_details: {
            first_name: freshName,
            email: freshEmail,
            phone: mobileNumber
        },
        item_details: [{
            id: course.id,
            price: finalPrice,
            quantity: 1,
            name: course.title.substring(0, 50)
        }]
    };

    let midtransResp;
    try {
        midtransResp = await snap.createTransaction(parameter);
    } catch (mErr: any) {
        console.error("MIDTRANS INVOICE ERROR:", mErr);
        // Cleanup: mark orphaned transaction as FAILED
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "FAILED" }
        });
        throw new Error(`MIDTRANS_REJECTED`);
    }

    const paymentLink = midtransResp.redirect_url;
    const paymentToken = midtransResp.token;

    if (!paymentLink) {
        console.error("MIDTRANS SUCCESS BUT NO LINK:", midtransResp);
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "FAILED" }
        });
        throw new Error("MIDTRANS_NO_LINK");
    }

    // 5. Update Transaction with Midtrans Details + set expiry deadline
    await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
            paymentToken: paymentToken,
            paymentUrl: paymentLink,
            expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
    });

    // 6. Return paymentUrl to Redirect user
    return {
        isFree: false,
        paymentUrl: paymentLink,
        transactionId: transaction.id
    };
}
