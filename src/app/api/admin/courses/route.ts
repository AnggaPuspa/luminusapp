import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            where: {
                deletedAt: null, // Only fetch non-deleted courses
            },
            include: {
                _count: {
                    select: { modules: true, enrollments: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(courses);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, originalPrice, discountedPrice, duration, status, thumbnailUrl } = body;

        if (!title || typeof originalPrice !== "number") {
            return NextResponse.json({ error: "Title and originalPrice are required" }, { status: 400 });
        }

        // Basic slug generation from title
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const newCourse = await prisma.course.create({
            data: {
                title,
                slug: `${slug}-${Date.now()}`, // Ensure unique slug
                description,
                originalPrice,
                discountedPrice,
                duration,
                status,
                thumbnailUrl,
            },
        });

        // Invalidate ISR cache so new course appears immediately
        revalidatePath('/');
        revalidatePath('/kursus');

        return NextResponse.json(newCourse, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to create course" },
            { status: 500 }
        );
    }
}
