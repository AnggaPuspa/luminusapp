import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { message: "Oops, we couldn't find an account matching that email and password." },
                { status: 401 }
            );
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { message: "Oops, we couldn't find an account matching that email and password." },
                { status: 401 }
            );
        }

        // Set JWT Session Cookie
        await createSession({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Failed to authenticate" },
            { status: 500 }
        );
    }
}
