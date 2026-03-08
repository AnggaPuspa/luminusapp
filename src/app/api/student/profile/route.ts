import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession, createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, name: true, email: true, avatarUrl: true, role: true, createdAt: true }
        });

        return NextResponse.json(user, { status: 200 });

    } catch (error: any) {
        console.error("Failed to fetch student profile:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password } = body;

        const updatedData: any = {};
        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updatedData,
            select: { id: true, name: true, email: true, avatarUrl: true, role: true }
        });

        // Update session if name or email changed
        if (name || email) {
            await createSession({
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
            });
        }

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

    } catch (error: any) {
        console.error("Failed to update student profile:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
