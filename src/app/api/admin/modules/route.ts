import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, courseId, sortOrder } = body;

        if (!title || !courseId) {
            return NextResponse.json({ message: "Title and courseId are required" }, { status: 400 });
        }

        const newModule = await prisma.module.create({
            data: {
                title,
                courseId,
                sortOrder: sortOrder || 0,
            },
        });

        return NextResponse.json(newModule, { status: 201 });
    } catch (error: any) {
        console.error("Error creating module:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
