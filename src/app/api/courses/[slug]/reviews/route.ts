import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Verify course exists first
        const course = await prisma.course.findUnique({
            where: { slug, status: "PUBLISHED", deletedAt: null },
            select: { id: true }
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        // Parse query params for pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Fetch paginated reviews with user details
        const reviews = await prisma.courseReview.findMany({
            where: { courseId: course.id },
            include: {
                user: {
                    select: {
                        name: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit,
        });

        // Get total count for pagination metadata
        const totalReviews = await prisma.courseReview.count({
            where: { courseId: course.id }
        });

        // Get rating aggregation
        const agg = await prisma.courseReview.aggregate({
            where: { courseId: course.id },
            _avg: { rating: true },
            _count: { rating: true }
        });

        return NextResponse.json({
            data: reviews,
            meta: {
                total: totalReviews,
                page,
                limit,
                totalPages: Math.ceil(totalReviews / limit),
                averageRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : 0,
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch reviews:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
