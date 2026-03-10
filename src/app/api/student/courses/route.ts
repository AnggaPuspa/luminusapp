import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getStudentCourses } from "@/services/student.service";

export async function GET() {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const courses = await getStudentCourses(session.user.id);
        return NextResponse.json(courses, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student courses:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
