import { NextResponse, type NextRequest } from "next/server"
import { verifySession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    const session = await verifySession(request)
    const user = session?.user

    const isLoginRoute = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register"
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
    const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard")
    const isClassroomRoute = request.nextUrl.pathname.includes("/belajar")

    // Redirect non-admins or unauthenticated users to login for admin routes
    if (isAdminRoute && (!user || user.role !== "ADMIN")) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    // Redirect unauthenticated users to login for student dashboard routes
    if ((isDashboardRoute || isClassroomRoute) && !user) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users trying to access login/register
    if (isLoginRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = user.role === "ADMIN" ? "/admin" : "/dashboard"
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
