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

        const { id: planId } = await params;
        const body = await request.json();
        const { courseIds } = body;

        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return NextResponse.json({ error: "courseIds array is required" }, { status: 400 });
        }

        // Bulk insert PlanCourse relations, ignoring duplicates
        const createdLinks = await prisma.$transaction(
            courseIds.map((courseId: string) =>
                prisma.planCourse.upsert({
                    where: {
                        planId_courseId: { planId, courseId }
                    },
                    update: {},
                    create: { planId, courseId }
                })
            )
        );

        return NextResponse.json({ success: true, count: createdLinks.length });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to assign courses to plan" },
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

        const { id: planId } = await params;
        const body = await request.json();
        const { courseIds } = body;

        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return NextResponse.json({ error: "courseIds array is required" }, { status: 400 });
        }

        // Bulk delete PlanCourse relations
        const deletedLinks = await prisma.planCourse.deleteMany({
            where: {
                planId,
                courseId: { in: courseIds }
            }
        });

        return NextResponse.json({ success: true, count: deletedLinks.count });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to remove courses from plan" },
            { status: 500 }
        );
    }
}
