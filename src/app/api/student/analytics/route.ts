import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getStudentAnalytics } from "@/services/student.service";

export async function GET() {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await getStudentAnalytics(session.user.id);
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch student analytics:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
