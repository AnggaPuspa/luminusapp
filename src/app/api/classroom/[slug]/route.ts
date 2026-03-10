import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getClassroomData } from "@/services/classroom.service";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        const course = await getClassroomData(session.user.id, slug, session.user.role);

        return NextResponse.json(course, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch classroom data:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.status || 500 }
        );
    }
}
