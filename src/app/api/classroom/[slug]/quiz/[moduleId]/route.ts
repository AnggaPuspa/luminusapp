import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getQuizForStudent } from "@/services/classroom.service";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string, moduleId: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug, moduleId } = await params;
        const data = await getQuizForStudent(session.user.id, slug, moduleId, session.user.role);

        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching student quiz:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.status || 500 }
        );
    }
}
