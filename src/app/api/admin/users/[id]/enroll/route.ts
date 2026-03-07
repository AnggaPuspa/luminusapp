import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id: userId } = await params;
        const body = await request.json();
        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        const enrollment = await prisma.enrollment.upsert({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            update: {
                status: "ACTIVE",
            },
            create: {
                userId,
                courseId,
                status: "ACTIVE",
            },
        });

        return NextResponse.json(
            { message: "User successfully enrolled", enrollment },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error manual enrollment:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
