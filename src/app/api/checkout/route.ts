import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { processCourseCheckout } from "@/services/checkout.service";

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

        const result = await processCourseCheckout({
            userId: session.user.id,
            userEmail: session.user.email,
            userName: session.user.name || "Student",
            courseId,
            couponCode,
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error("Checkout API Error:", error);

        const statusMap: Record<string, number> = {
            COURSE_NOT_FOUND: 404,
            COURSE_UNAVAILABLE: 404, // Used interchangeably for simplicity
            ALREADY_ENROLLED: 400,
            PRICE_TOO_LOW: 400,
            MAYAR_NO_LINK: 502,
            MAYAR_REJECTED: 502,
        };

        const status = statusMap[error.message] || 500;

        const messageMap: Record<string, string> = {
            COURSE_NOT_FOUND: "Course not found or unavailable",
            ALREADY_ENROLLED: "You are already enrolled in this course.",
            PRICE_TOO_LOW: "Harga kursus terlalu rendah. Minimum transaksi Mayar adalah Rp 500.",
        };

        const message = messageMap[error.message] || error.message || "Internal Server Error";

        return NextResponse.json({ message }, { status });
    }
}
