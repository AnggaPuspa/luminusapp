import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { courseId } = await params;
        const userId = session.user.id;

        // 1. Fetch Enrollment to check status and existing certificate
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                status: {
                    in: ["ACTIVE", "COMPLETED"]
                }
            },
            include: {
                user: { select: { name: true } },
                course: { select: { title: true, id: true } }
            }
        });

        if (!enrollment) {
            return NextResponse.json({ error: "No active enrollment found for this course" }, { status: 404 });
        }

        // TS Server workaround: cast enrollment to any because the Prisma client types 
        // in the IDE haven't synced with the latest db push yet.
        const typedEnrollment = enrollment as any;

        // If certificate already exists, just return it
        if (typedEnrollment.certificateUrl) {
            return NextResponse.json({
                hasCertificate: true,
                certificateUrl: typedEnrollment.certificateUrl
            }, { status: 200 });
        }

        // 2. Check complete progress
        // Find all lessons for the course
        const lessons = await prisma.lesson.findMany({
            where: { module: { courseId } },
            select: { id: true }
        });

        // Find user's progress for these lessons
        const progress = await prisma.lessonProgress.count({
            where: {
                userId,
                lessonId: { in: lessons.map((l: any) => l.id) },
                completed: true
            }
        });

        // If not 100% completed, deny certificate
        if (progress < lessons.length || lessons.length === 0) {
            return NextResponse.json({
                error: "Course not yet fully completed.",
                progress: `${progress}/${lessons.length}`
            }, { status: 403 });
        }

        // 3. 100% completed, return data needed for client-side generation
        // Format dates
        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric', month: 'long', day: 'numeric'
        };
        const completionDate = new Date().toLocaleDateString('id-ID', dateOptions);

        // Generate a pseudo-random ID for display
        const certificateId = `LMN-${enrollment.id.substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        return NextResponse.json({
            hasCertificate: false,
            studentName: enrollment.user.name,
            courseTitle: enrollment.course.title,
            completionDate,
            certificateId,
            enrollmentId: enrollment.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Certificate API Error:", error);
        return NextResponse.json(
            { error: "Failed to process certificate request" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { enrollmentId, certificateUrl } = body;

        if (!enrollmentId || !certificateUrl) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Verify the enrollment belongs to the user
        const enrollment = await prisma.enrollment.findFirst({
            where: { id: enrollmentId, userId }
        });

        if (!enrollment) {
            return NextResponse.json({ message: "Invalid enrollment" }, { status: 404 });
        }

        // Update the database with the generated URL
        // Cast as any because TS server hasn't synced Prisma generated types yet
        await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { certificateUrl } as any
        });

        return NextResponse.json({ success: true, certificateUrl }, { status: 200 });

    } catch (error: any) {
        console.error("Certificate Save API Error:", error);
        return NextResponse.json(
            { error: "Failed to save certificate" },
            { status: 500 }
        );
    }
}
