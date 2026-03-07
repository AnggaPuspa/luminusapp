import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        lessons: {
                            orderBy: { sortOrder: "asc" },
                        },
                    },
                },
            },
        });

        if (!course || course.deletedAt) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch course" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, originalPrice, discountedPrice, duration, status, thumbnailUrl } = body;

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
                title,
                description,
                originalPrice,
                discountedPrice,
                duration,
                status,
                thumbnailUrl,
            },
        });

        // Invalidate ISR cache for pages that display courses
        revalidatePath('/');
        revalidatePath('/kursus');

        return NextResponse.json(updatedCourse);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to update course" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        // Soft Delete: update deletedAt field instead of removing the record
        const deletedCourse = await prisma.course.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // Invalidate ISR cache for pages that display courses
        revalidatePath('/');
        revalidatePath('/kursus');

        return NextResponse.json({ success: true, message: "Course deleted successfully" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to delete course" },
            { status: 500 }
        );
    }
}
