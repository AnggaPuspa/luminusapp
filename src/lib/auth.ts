import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET environment variable is required!");
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // Session expires in 7 days
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(user: { id: string; email: string; name: string; role: string }) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await encrypt({ user, expires });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function verifySession(request?: NextRequest) {
    let sessionCookie;
    if (request) {
        sessionCookie = request.cookies.get("session")?.value;
    } else {
        const cookieStore = await cookies();
        sessionCookie = cookieStore.get("session")?.value;
    }

    if (!sessionCookie) return null;

    return await decrypt(sessionCookie);
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
        expires: new Date(0),
        path: "/",
    });
}
