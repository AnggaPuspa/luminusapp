import { NextResponse } from "next/server";
import { getMonthlyActivityByYear } from "@/services/admin.service";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        // Check if user is logged in AND is an ADMIN
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized access. Admin only." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get('year');
        const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

        if (isNaN(year)) {
            return NextResponse.json({ message: "Invalid year parameter." }, { status: 400 });
        }

        const data = await getMonthlyActivityByYear(year);

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Failed to fetch monthly activity data:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
