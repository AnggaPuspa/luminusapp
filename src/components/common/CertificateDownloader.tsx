"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { uploadCertificateToStorage } from "@/lib/certificate";

interface CertificateDownloaderProps {
    courseId: string;
    userId: string;
    triggerButtonText?: string;
    variant?: "primary" | "secondary" | "icon";
    disabled?: boolean;
}

function generateCertificatePdf(studentName: string, courseTitle: string, completionDate: string, certificateId: string): jsPDF {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = 297, h = 210;

    // Background gradient effect
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, w, h, 'F');

    // Decorative corner borders (top-left)
    pdf.setDrawColor(37, 99, 235); // blue-600
    pdf.setLineWidth(4);
    pdf.line(16, 16, 80, 16); // top
    pdf.line(16, 16, 16, 80); // left

    // Decorative corner borders (bottom-right)
    pdf.line(w - 16, h - 16, w - 80, h - 16); // bottom
    pdf.line(w - 16, h - 16, w - 16, h - 80);  // right

    // Inner border
    pdf.setDrawColor(191, 219, 254); // blue-200
    pdf.setLineWidth(0.5);
    pdf.roundedRect(12, 12, w - 24, h - 24, 4, 4);

    // Logo box
    pdf.setFillColor(37, 99, 235);
    pdf.roundedRect(w / 2 - 40, 28, 12, 12, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("L", w / 2 - 37.5, 37);

    // Brand name
    pdf.setTextColor(30, 58, 138); // blue-900
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Luminus Education", w / 2 - 24, 37);

    // Title
    pdf.setTextColor(31, 41, 55); // gray-800
    pdf.setFontSize(28);
    pdf.setFont("times", "bold");
    pdf.text("CERTIFICATE OF COMPLETION", w / 2, 58, { align: "center" });

    // Divider
    pdf.setDrawColor(59, 130, 246); // blue-500
    pdf.setLineWidth(1);
    pdf.line(w / 2 - 30, 64, w / 2 + 30, 64);

    // Subtitle
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("KAMI MENYATAKAN DENGAN BANGGA BAHWA", w / 2, 76, { align: "center" });

    // Student Name
    pdf.setTextColor(30, 58, 138);
    pdf.setFontSize(36);
    pdf.setFont("times", "bolditalic");
    pdf.text(studentName || "Student", w / 2, 98, { align: "center" });

    // Name underline
    pdf.setDrawColor(229, 231, 235); // gray-200
    pdf.setLineWidth(0.5);
    const nameWidth = Math.min(pdf.getTextWidth(studentName || "Student") + 20, 200);
    pdf.line(w / 2 - nameWidth / 2, 103, w / 2 + nameWidth / 2, 103);

    // Description
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("telah berhasil menyelesaikan dengan memuaskan kelas:", w / 2, 116, { align: "center" });

    // Course Title
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    // Wrap long course titles
    const titleLines = pdf.splitTextToSize(courseTitle || "Course", 200);
    pdf.text(titleLines, w / 2, 132, { align: "center" });

    // Footer divider
    const footerY = 160;
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.line(40, footerY, w - 40, footerY);

    // Footer - Date
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text("TANGGAL PENYELESAIAN", 55, footerY + 10, { align: "center" });
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(completionDate || "-", 55, footerY + 16, { align: "center" });

    // Footer - Trophy
    pdf.setFontSize(24);
    pdf.text("🏆", w / 2, footerY + 12, { align: "center" });
    pdf.setTextColor(30, 58, 138);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Luminus Team", w / 2, footerY + 20, { align: "center" });

    // Footer - Certificate ID
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text("ID SERTIFIKAT", w - 55, footerY + 10, { align: "center" });
    pdf.setFillColor(243, 244, 246); // gray-100
    const idText = certificateId || "LMN-XXXX";
    const idWidth = pdf.getTextWidth(idText) + 8;
    pdf.roundedRect(w - 55 - idWidth / 2, footerY + 12, idWidth, 7, 1, 1, 'F');
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(8);
    pdf.setFont("courier", "normal");
    pdf.text(idText, w - 55, footerY + 17, { align: "center" });

    return pdf;
}

export default function CertificateDownloader({
    courseId,
    userId,
    triggerButtonText = "Download Sertifikat",
    variant = "primary",
    disabled = false
}: CertificateDownloaderProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        toast.loading("Memproses sertifikat...", { id: `cert-${courseId}` });

        try {
            const res = await fetch(`/api/student/certificate/${courseId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengambil data sertifikat");
            }

            // If certificate already cached, open directly
            if (data.hasCertificate && data.certificateUrl) {
                toast.success("Membuka sertifikat...", { id: `cert-${courseId}` });
                window.open(data.certificateUrl, '_blank');
                setIsGenerating(false);
                return;
            }

            // Generate PDF directly with jsPDF
            toast.loading("Membuat PDF...", { id: `cert-${courseId}` });
            const pdf = generateCertificatePdf(
                data.studentName,
                data.courseTitle,
                data.completionDate,
                data.certificateId
            );

            // Download langsung
            pdf.save(`Sertifikat_${data.courseTitle?.replace(/\s+/g, '_') || 'Certificate'}.pdf`);
            toast.success("Sertifikat berhasil diunduh!", { id: `cert-${courseId}` });

            // Upload ke Supabase di background (optional caching)
            try {
                const pdfBlob = pdf.output('blob');
                const publicUrl = await uploadCertificateToStorage(pdfBlob, userId || 'unknown', courseId);
                if (publicUrl && data.enrollmentId) {
                    await fetch(`/api/student/certificate/${courseId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ enrollmentId: data.enrollmentId, certificateUrl: publicUrl })
                    });
                }
            } catch {
                // Upload gagal gak masalah, PDF udah ke-download
            }

        } catch (error: any) {
            toast.error(error.message || "Gagal membuat sertifikat", { id: `cert-${courseId}` });
        } finally {
            setIsGenerating(false);
        }
    };

    const buttonStyles = {
        primary: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-sm",
        secondary: "flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition",
        icon: "p-2 rounded-full bg-white border text-blue-600 hover:bg-blue-50 transition"
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating || disabled}
            className={`${buttonStyles[variant]} ${isGenerating || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            title={triggerButtonText}
        >
            {isGenerating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <Download className="w-4 h-4" />
            )}
            {variant !== "icon" && <span>{isGenerating ? "Memproses..." : triggerButtonText}</span>}
        </button>
    );
}
