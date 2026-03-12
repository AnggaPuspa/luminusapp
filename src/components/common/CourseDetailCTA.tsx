"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CheckoutButton from "@/components/common/CheckoutButton";

interface CourseDetailCTAProps {
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    originalPrice: number;
    discountedPrice?: number | null;
}

export default function CourseDetailCTA({
    courseId,
    courseSlug,
    courseTitle,
    originalPrice,
    discountedPrice,
}: CourseDetailCTAProps) {
    const [accessStatus, setAccessStatus] = useState<
        "loading" | "guest" | "subscriber" | "enrolled" | "purchase"
    >("loading");

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch(`/api/course-access?courseId=${courseId}`);
                if (!res.ok) {
                    setAccessStatus("guest");
                    return;
                }
                const data = await res.json();

                if (data.hasAccess && data.accessType === "SUBSCRIPTION") {
                    // Check if user has started learning (completedLessons >= 1)
                    setAccessStatus(data.hasProgress ? "enrolled" : "subscriber");
                } else if (data.hasAccess && data.accessType === "PURCHASE") {
                    setAccessStatus("enrolled");
                } else {
                    setAccessStatus("purchase");
                }
            } catch {
                setAccessStatus("guest");
            }
        };

        checkAccess();
    }, [courseId]);

    if (accessStatus === "loading") {
        return (
            <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-xl text-lg flex justify-center items-center animate-pulse">
                Memuat...
            </div>
        );
    }

    // Subscriber who hasn't started or just browsing
    if (accessStatus === "subscriber") {
        return (
            <>
                <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Termasuk di Paket Langgananmu
                    </span>
                </div>
                <Link
                    href={`/kursus/${courseSlug}/belajar`}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-lg transition shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mulai Belajar Gratis
                </Link>
                <p className="text-center text-sm text-emerald-600 mt-3 font-medium">
                    🎉 Tidak perlu bayar lagi — bagian dari langgananmu!
                </p>
            </>
        );
    }

    // Already enrolled with progress
    if (accessStatus === "enrolled") {
        return (
            <Link
                href={`/kursus/${courseSlug}/belajar`}
                className="w-full py-4 bg-gradient-to-r from-gradient-1 to-gradient-2 hover:opacity-90 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lanjutkan Belajar
            </Link>
        );
    }

    // Default: purchase flow (guest or non-subscriber)
    return (
        <>
            <CheckoutButton
                courseId={courseId}
                title={courseTitle}
                originalPrice={originalPrice}
                discountedPrice={discountedPrice}
                className="w-full py-4 bg-gradient-to-r from-gradient-1 to-gradient-2 hover:opacity-90 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-lg shadow-indigo-500/30 flex justify-center items-center"
            />
            <p className="text-center text-sm text-gray-500 mt-4">
                Akses selamanya & update materi gratis
            </p>
        </>
    );
}
