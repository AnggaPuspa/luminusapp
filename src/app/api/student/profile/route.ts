import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getStudentProfile, updateStudentProfile } from "@/services/student.service";

export async function GET() {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await getStudentProfile(session.user.id);
        return NextResponse.json(user, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student profile:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password, phoneNumber } = body;

        const updatedUser = await updateStudentProfile(session.user.id, { name, email, password, phoneNumber });
        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to update student profile:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
