import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const { name, email, phoneNumber, password } = await request.json();

        if (!name || !email || !password || !phoneNumber) {
            return NextResponse.json(
                { message: "Name, email, phone number, and password are required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email is already registered" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                password: hashedPassword,
                // Role defaults to STUDENT per Prisma schema
            },
        });

        // Automatically log the user in after registration
        await createSession({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
        });

        // Fire welcome email asynchronously
        sendWelcomeEmail(newUser.name, newUser.email).catch(err => console.error("Welcome email error:", err));

        return NextResponse.json({ message: "Registration successful" }, { status: 201 });
    } catch (error: any) {
        console.error("Register error:", error);
        return NextResponse.json(
            { message: "Failed to register new user" },
            { status: 500 }
        );
    }
}
