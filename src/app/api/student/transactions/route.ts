import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getStudentTransactions } from "@/services/student.service";

export async function GET() {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const transactions = await getStudentTransactions(session.user.id);
        return NextResponse.json(transactions, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student transactions:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
