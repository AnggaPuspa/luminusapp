import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch only active plans, ordered by sortOrder
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        // Also figure out course inclusion bounds to tell the user how many courses are included
        const plansWithDetails = await Promise.all(plans.map(async (plan) => {
            let includedCourseCount = 0;
            if (plan.allCoursesIncluded) {
                includedCourseCount = await prisma.course.count({ where: { status: 'PUBLISHED', deletedAt: null } });
            } else {
                includedCourseCount = await prisma.planCourse.count({ where: { planId: plan.id } });
            }
            return {
                ...plan,
                includedCourseCount
            };
        }));

        return NextResponse.json(plansWithDetails);
    } catch (error) {
        console.error("Pricing API Error:", error);
        return NextResponse.json({ message: "Gagal mengambil data paket langganan" }, { status: 500 });
    }
}
