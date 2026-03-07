import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

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

        // 2. Security Check: ACTIVE enrollment only
        // Admin user can bypass enrollment check for preview
        if (session.user.role !== "ADMIN") {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId: course.id,
                    }
                }
            });

            if (!enrollment || enrollment.status !== "ACTIVE") {
                return NextResponse.json(
                    { message: "Access Denied: You must enroll in this course to access the classroom." },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json(course, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch classroom data:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
