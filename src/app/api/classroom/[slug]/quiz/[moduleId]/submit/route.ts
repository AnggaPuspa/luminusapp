import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { submitQuizAnswers } from "@/services/classroom.service";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string, moduleId: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug, moduleId } = await params;
        const body = await request.json();

        const result = await submitQuizAnswers(
            session.user.id, slug, moduleId, body.answers, session.user.role
        );

        return NextResponse.json({
            message: "Quiz submitted successfully",
            ...result,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error submitting student quiz:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.status || 500 }
        );
    }
}
