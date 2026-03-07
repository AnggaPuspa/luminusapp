import { supabase } from "@/lib/supabase";

export async function uploadCertificateToStorage(
    pdfBlob: Blob,
    userId: string,
    courseId: string
): Promise<string | null> {
    try {
        const fileName = `${userId}_${courseId}_${Date.now()}.pdf`;
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('certificates')
            .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (error) {
            console.error("Supabase storage upload error:", error);
            return null;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('certificates')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error("Failed to upload certificate:", error);
        return null;
    }
}
