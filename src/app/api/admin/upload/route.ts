import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        // Check if user is logged in AND is an ADMIN
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized accesses. Admin only." }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ message: "File must be an image" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ message: "Supabase Role Key is missing in .env" }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        // Convert file to buffer for Supabase
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let { data, error } = await supabaseAdmin.storage
            .from("course-thumbnails")
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        // Auto-create bucket if it doesn't exist
        if (error && error.message === "Bucket not found") {
            const { error: createError } = await supabaseAdmin.storage.createBucket('course-thumbnails', {
                public: true,
                allowedMimeTypes: ['image/*'],
                fileSizeLimit: 5242880 // 5MB limit
            });

            if (!createError) {
                // Retry upload
                const retryUpload = await supabaseAdmin.storage
                    .from("course-thumbnails")
                    .upload(filePath, buffer, {
                        contentType: file.type,
                        cacheControl: '3600',
                        upsert: false
                    });
                data = retryUpload.data;
                error = retryUpload.error;
            } else {
                console.error("Failed to auto-create bucket:", createError);
            }
        }

        if (error) {
            console.error("Supabase FULL storage error:", JSON.stringify(error, null, 2));
            // Return full error details to frontend to debug
            return NextResponse.json({
                message: "Supabase Error: " + (error.message || JSON.stringify(error))
            }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from("course-thumbnails")
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl }, { status: 200 });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Internal server error during upload" }, { status: 500 });
    }
}
