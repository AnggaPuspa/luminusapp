"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Award, ReceiptText, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function StudentOverviewPage() {
    const [stats, setStats] = useState<any>({
        activeCourses: 0,
        completedLessons: 0,
        totalTransactions: 0,
        pendingTransactions: 0,
        recentCourses: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/student/overview");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: "Kelas Aktif", value: stats.activeCourses, icon: PlayCircle, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Materi Selesai", value: stats.completedLessons, icon: Award, color: "text-green-600", bg: "bg-green-100" },
        { title: "Total Transaksi", value: stats.totalTransactions, icon: ReceiptText, color: "text-purple-600", bg: "bg-purple-100" },
        { title: "Menunggu Pembayaran", value: stats.pendingTransactions, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    ];

    const recentCourses = stats.recentCourses || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Selamat datang kembali! Lanjutkan progres belajarmu hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${card.bg} ${card.color}`}>
                            <card.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {loading ? "..." : card.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Kelas Terakhir Dibuka</h2>
                    {recentCourses.length > 0 && (
                        <Link href="/dashboard/courses" className="text-sm text-[#696EFF] font-medium hover:underline flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i: number) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg animate-pulse">
                                <div className="w-16 h-12 bg-gray-200 rounded-lg shrink-0"></div>
                                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-2/3"></div></div>
                            </div>
                        ))}
                    </div>
                ) : recentCourses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <PlayCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Kamu belum mulai kelas satupun.</p>
                        <p className="text-sm">Yuk mulai belajar!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentCourses.map((course: any) => (
                            <Link
                                key={course.id}
                                href={`/kursus/${course.slug}/belajar`}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-16 h-12 relative bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    {course.thumbnailUrl ? (
                                        <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PlayCircle className="w-6 h-6 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate group-hover:text-[#696EFF] transition-colors">{course.title}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#696EFF] transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
