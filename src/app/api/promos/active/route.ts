import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const now = new Date();
        
        const promo = await prisma.promoPopup.findFirst({
            where: {
                isActive: true,
                startDate: { lte: now },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } }
                ]
            },
            orderBy: { priority: 'desc' },
        });

        if (!promo) {
            return NextResponse.json(null, { status: 200 }); // Return null if no active promo
        }

        return NextResponse.json(promo, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch active promo:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
