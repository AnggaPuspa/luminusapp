import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const plans = await prisma.subscriptionPlan.findMany({
            include: {
                _count: {
                    select: { subscriptions: true, includedCourses: true },
                },
            },
            orderBy: {
                sortOrder: "asc",
            },
        });

        return NextResponse.json(plans);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch subscription plans" },
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
        const {
            name, tier, description, monthlyPrice, yearlyPrice,
            features, allCoursesIncluded, communityInviteUrl, aiMentorQuota
        } = body;

        if (!name || typeof monthlyPrice !== "number") {
            return NextResponse.json({ error: "Name and monthlyPrice are required" }, { status: 400 });
        }

        // Basic slug generation from name
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const newPlan = await prisma.subscriptionPlan.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}`, // Ensure unique slug
                tier: tier || "MURID",
                description,
                monthlyPrice,
                yearlyPrice,
                features,
                allCoursesIncluded: allCoursesIncluded || false,
                communityInviteUrl,
                aiMentorQuota: aiMentorQuota || 0,
            },
        });

        return NextResponse.json(newPlan, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to create subscription plan" },
            { status: 500 }
        );
    }
}
