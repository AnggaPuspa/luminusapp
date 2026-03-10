import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { updateAvatar } from "@/services/student.service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ message: "Hanya file JPG dan PNG yang diperbolehkan." }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ message: "Ukuran file maksimal 2MB." }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ message: "Supabase config missing" }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let { data, error } = await supabaseAdmin.storage
            .from("avatars")
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true
            });

        // Auto-create bucket if not exists
        if (error && error.message === "Bucket not found") {
            await supabaseAdmin.storage.createBucket('avatars', {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
                fileSizeLimit: MAX_SIZE
            });

            const retry = await supabaseAdmin.storage
                .from("avatars")
                .upload(filePath, buffer, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: true
                });
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error("Avatar upload error:", error);
            return NextResponse.json({ message: "Upload gagal: " + error.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from("avatars")
            .getPublicUrl(filePath);

        // Update DB via service layer
        await updateAvatar(session.user.id, publicUrl);

        return NextResponse.json({ avatarUrl: publicUrl }, { status: 200 });

    } catch (error: any) {
        console.error("Avatar upload error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
