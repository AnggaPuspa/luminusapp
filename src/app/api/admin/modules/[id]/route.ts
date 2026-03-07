import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, sortOrder } = body;

        const updatedModule = await prisma.module.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(sortOrder !== undefined && { sortOrder }),
            },
        });

        return NextResponse.json(updatedModule, { status: 200 });
    } catch (error: any) {
        console.error("Error updating module:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Deleting the module will cascade and delete all related lessons
        await prisma.module.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Module deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting module:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
