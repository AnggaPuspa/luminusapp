import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { submitCourseReview } from "@/services/student.service";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const review = await submitCourseReview(session.user.id, session.user.role, body);

        return NextResponse.json({ message: "Review submitted successfully", review }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to submit review:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.status || 500 }
        );
    }
}
