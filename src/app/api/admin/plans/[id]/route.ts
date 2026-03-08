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
        const {
            name, tier, description, monthlyPrice, yearlyPrice,
            isActive, features, allCoursesIncluded, communityInviteUrl,
            aiMentorQuota, sortOrder
        } = body;

        const updatedData: any = {};
        if (name !== undefined) updatedData.name = name;
        if (tier !== undefined) updatedData.tier = tier;
        if (description !== undefined) updatedData.description = description;
        if (monthlyPrice !== undefined) updatedData.monthlyPrice = parseInt(monthlyPrice);
        if (yearlyPrice !== undefined) updatedData.yearlyPrice = yearlyPrice ? parseInt(yearlyPrice) : null;
        if (isActive !== undefined) updatedData.isActive = isActive;
        if (features !== undefined) updatedData.features = features;
        if (allCoursesIncluded !== undefined) updatedData.allCoursesIncluded = allCoursesIncluded;
        if (communityInviteUrl !== undefined) updatedData.communityInviteUrl = communityInviteUrl;
        if (aiMentorQuota !== undefined) updatedData.aiMentorQuota = parseInt(aiMentorQuota);
        if (sortOrder !== undefined) updatedData.sortOrder = parseInt(sortOrder);

        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id },
            data: updatedData,
        });

        return NextResponse.json(updatedPlan, { status: 200 });
    } catch (error: any) {
        console.error("Error updating plan:", error);
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

        // Only allow deletion if no active subscriptions
        const activeSubs = await prisma.userSubscription.count({
            where: { planId: id, status: "ACTIVE" }
        });

        if (activeSubs > 0) {
            return NextResponse.json(
                { message: "Cannot delete plan with active subscriptions. You can deactivate it instead." },
                { status: 400 }
            );
        }

        await prisma.subscriptionPlan.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Plan deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting plan:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
