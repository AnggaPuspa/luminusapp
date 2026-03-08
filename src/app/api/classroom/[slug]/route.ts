import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { checkCourseAccess, checkSubscriberAccess } from "@/lib/access-control";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { slug } = await params;

        // 1. Find Course with all necessary relations in a single query
        const course = await prisma.course.findUnique({
            where: { slug },
            include: {
                modules: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        quiz: {
                            select: { id: true, title: true }
                        },
                        lessons: {
                            orderBy: { sortOrder: "asc" },
                            include: {
                                progress: {
                                    where: { userId },
                                    select: { completed: true, completedAt: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        // 2. Security Check: ACTIVE enrollment or VALID SUBSCRIPTION
        // Admin user can bypass enrollment check for preview
        if (session.user.role !== "ADMIN") {
            const access = await checkCourseAccess(userId, course.id);

            if (!access.hasAccess) {
                return NextResponse.json(
                    { message: "Access Denied: You must be enrolled or have an active subscription covering this course." },
                    { status: 403 }
                );
            }
            // Add access type to response so frontend can show/hide premium features
            (course as any).accessType = access.accessType;

            // Also inject subscriber status — separate from accessType
            // A user can access via PURCHASE but still be a subscriber with resource download rights
            const subAccess = await checkSubscriberAccess(userId);
            (course as any).isSubscriber = subAccess.isSubscriber;
        }

        return NextResponse.json(course, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch classroom data:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
