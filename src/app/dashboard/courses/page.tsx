"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, PlayCircle, Calendar, BookOpen, LayoutGrid, List, Award, Target, Trophy, Clock, Lock, GraduationCap, Mail, Bell, User, Eye, Download, X } from "lucide-react";
import StudentTopbar from "@/components/dashboard/StudentTopbar";
import CertificateDownloader from "@/components/common/CertificateDownloader";
import CertificateTemplate from "@/components/common/CertificateTemplate";
import { toast } from "sonner";
import { useStudentCourses, useAvailableCourses, useStudentProfile, useDashboardOverview } from "@/hooks/use-dashboard";

interface CourseItem {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    thumbnailUrl: string | null;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
    userId: string;
    enrolledAt: string;
    source?: string;
}

interface Analytics {
    recentAttempts: {
        id: string;
        quizTitle: string;
        courseId: string | null;
        score: number;
        totalQ: number;
        createdAt: string;
    }[];
}

const CourseCard = ({ course, viewMode, selectedCourseId, onClick, isAvailable = false }: any) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm border hover:shadow-lg hover:shadow-gray-200/50 transition-all cursor-pointer group ${viewMode === 'list' ? 'p-3 flex flex-row items-stretch gap-4' : 'p-4 flex flex-col'} ${selectedCourseId === course.id ? 'border-[#696EFF] ring-2 ring-[#696EFF]/20 shadow-md shadow-[#696EFF]/10' : 'border-gray-100'}`}
        >
            {/* Image Box */}
            <div className={`relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ${viewMode === 'list' ? 'w-48 h-full min-h-[120px]' : 'w-full h-40 mb-4'}`}>
                {course.thumbnailUrl ? (
                    <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 flex-col">
                        <PlayCircle className={viewMode === 'list' ? "w-8 h-8" : "w-10 h-10"} />
                    </div>
                )}
            </div>

            {/* Content wrapper */}
            <div className={`flex flex-col flex-1 min-w-0 ${viewMode === 'list' ? 'py-1 justify-center' : ''}`}>
                <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mb-1' : 'mb-3'}`}>
                    {(course.source === 'SUBSCRIPTION' || isAvailable) ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-100/50 text-purple-600 text-[10px] font-bold rounded flex-shrink-0 tracking-widest relative overflow-hidden group/badge shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover/badge:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="w-[14px] h-[14px] rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-inner">
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            LANGGANAN
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200/50 text-gray-600 text-[10px] font-bold rounded flex-shrink-0 tracking-widest shadow-sm">
                            <div className="w-[14px] h-[14px] rounded-full bg-gray-800 flex items-center justify-center">
                                <Lock className="w-2 h-2 text-white" />
                            </div>
                            LIFETIME
                        </div>
                    )}
                    {viewMode === 'grid' && (
                        isAvailable ? (
                            <Link
                                href={`/kursus/${course.slug}/belajar`}
                                className="px-3 py-1.5 rounded-[12px] border border-[#E9D5FF] text-[#A855F7] text-xs font-semibold hover:bg-[#A855F7] hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0"
                            >
                                <Play className="w-[10px] h-[10px] fill-current" /> Mulai
                            </Link>
                        ) : course.progressPercent === 100 ? (
                            <Link
                                href={`/kursus/${course.slug}/belajar`}
                                className="px-3 py-1.5 rounded-[12px] border border-[#111111] bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                            >
                                <Award className="w-[10px] h-[10px] fill-current" /> Detail
                            </Link>
                        ) : (
                            <Link
                                href={`/kursus/${course.slug}/belajar`}
                                className="px-3 py-1.5 rounded-[12px] border border-[#E9D5FF] text-[#A855F7] text-xs font-semibold hover:bg-[#A855F7] hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0"
                            >
                                <Play className="w-[10px] h-[10px] fill-current" /> Lanjut
                            </Link>
                        )
                    )}
                </div>

                <h3 className={`font-bold text-gray-900 leading-tight ${viewMode === 'list' ? 'mb-2 text-[15px] truncate' : 'mb-2 line-clamp-2'}`}>
                    {course.title}
                </h3>

                {viewMode === 'grid' && (
                    <p className="text-[13px] text-gray-500 mb-5 leading-relaxed flex-grow min-h-[40px]">
                        {(course.description && course.description.length > 55)
                            ? <>{course.description.substring(0, 55).trim()}... <span className="text-[#8B7AFF] font-semibold whitespace-nowrap">baca selengkapnya</span></>
                            : course.description || "Tidak ada deskripsi tersedia untuk kelas ini."
                        }
                    </p>
                )}

                <div className={viewMode === 'list' ? 'flex flex-row items-center justify-between mt-auto gap-4 pt-2 border-t border-gray-50' : 'contents'}>
                    <div className={viewMode === 'list' ? 'flex-1' : 'w-full'}>
                        {!isAvailable && (
                            <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${viewMode === 'grid' ? 'h-1.5 mb-5 mt-auto' : 'h-2 mb-2 w-3/4'}`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${course.progressPercent === 100 ? 'bg-green-500' : 'bg-[#696EFF]'}`}
                                    style={{ width: `${course.progressPercent}%` }}
                                ></div>
                            </div>
                        )}

                        <div className={`flex items-center gap-3 ${viewMode === 'list' ? '' : ''}`}>
                            {viewMode === 'grid' && !isAvailable && (
                                <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#8B7AFF] flex-shrink-0">
                                    {course.progressPercent === 100 ? <Trophy className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                                </div>
                            )}
                            <div className="text-xs">
                                {viewMode === 'grid' && !isAvailable && (
                                    <p className="font-semibold text-gray-900">
                                        {course.progressPercent === 100 ? 'Selesai' : 'Progres Belajar'}
                                    </p>
                                )}
                                {!isAvailable ? (
                                    <p className={`font-medium ${viewMode === 'list' ? 'text-gray-600' : 'text-gray-500'}`}>
                                        {course.completedLessons} dari {course.totalLessons} materi diselesaikan <span className="font-bold text-gray-900 ml-1">({course.progressPercent}%)</span>
                                    </p>
                                ) : (
                                    <p className={`font-medium ${viewMode === 'list' ? 'text-gray-600' : 'text-gray-500'} flex items-center gap-1.5`}>
                                        <Clock className="w-3.5 h-3.5" /> {(course.duration / 60).toFixed(0)} jam belajar
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {viewMode === 'list' && (
                        <div className="flex-shrink-0 pr-2">
                            {isAvailable ? (
                                <Link
                                    href={`/kursus/${course.slug}/belajar`}
                                    className="px-5 py-2.5 rounded-xl bg-[#8B7AFF] text-white text-xs font-bold hover:bg-[#7E6CE0] transition-all flex items-center gap-2 shadow-md shadow-[#8B7AFF]/20"
                                >
                                    <Play className="w-[12px] h-[12px] fill-current" /> Mulai Belajar
                                </Link>
                            ) : course.progressPercent === 100 ? (
                                <Link
                                    href={`/kursus/${course.slug}/belajar`}
                                    className="px-5 py-2 rounded-xl border border-[#111111] bg-[#111111] text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <Award className="w-[12px] h-[12px] fill-current" /> Detail
                                </Link>
                            ) : (
                                <Link
                                    href={`/kursus/${course.slug}/belajar`}
                                    className="px-5 py-2.5 rounded-xl bg-[#8B7AFF] text-white text-xs font-bold hover:bg-[#7E6CE0] transition-all flex items-center gap-2 shadow-md shadow-[#8B7AFF]/20"
                                >
                                    <Play className="w-[12px] h-[12px] fill-current" /> Lanjut Belajar
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function MyCoursesPage() {
    const { courses, isLoading: loading } = useStudentCourses();
    const { availableCourses, isLoading: loadingAvailable } = useAvailableCourses();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [previewCertData, setPreviewCertData] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const { profile } = useStudentProfile();
    const { stats } = useDashboardOverview();

    useEffect(() => {
        if (courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, selectedCourseId]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/student/analytics");
                if (res.ok) setAnalytics(await res.json());
            } catch (e) { console.error("Failed to fetch analytics", e); }
        };
        fetchAnalytics();
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Jan 01, 2024";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    };

    // Calculate aggregated stats
    // Derive selected course data
    const activeCourse = courses.find((c: any) => c.id === selectedCourseId) || courses[0];
    const totalLessons = activeCourse?.totalLessons || 0;
    const completedLessons = activeCourse?.completedLessons || 0;
    const overallProgress = activeCourse?.progressPercent || 0;

    // Filter analytics for selected course
    let selectedAttempts: Analytics['recentAttempts'] = [];
    let avgScore = 0;
    if (analytics?.recentAttempts) {
        selectedAttempts = analytics.recentAttempts.filter(a => a.courseId === selectedCourseId);
        if (selectedAttempts.length > 0) {
            const sum = selectedAttempts.reduce((acc, a) => acc + (a.score / a.totalQ), 0);
            avgScore = Math.round((sum / selectedAttempts.length) * 100);
        }
    }

    const handlePreviewCert = async (courseId: string) => {
        setIsPreviewLoading(true);
        try {
            const res = await fetch(`/api/student/certificate/${courseId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengambil data sertifikat");
            }

            if (data.hasCertificate && data.certificateUrl) {
                toast.success("Membuka sertifikat baru...", { id: `preview-${courseId}` });
                window.open(data.certificateUrl, '_blank');
            } else {
                setPreviewCertData({
                    courseId: courseId,
                    studentName: data.studentName,
                    courseTitle: data.courseTitle,
                    completionDate: data.completionDate,
                    certificateId: data.certificateId
                });
                setIsPreviewOpen(true);
            }
        } catch (error: any) {
            toast.error(error.message || "Gagal memuat preview sertifikat", { id: `preview-${courseId}` });
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const filteredCourses = courses.filter((course: any) => {
        if (filter === 'COMPLETED') return course.progressPercent === 100;
        if (filter === 'IN_PROGRESS') return course.progressPercent < 100;
        return true;
    });

    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const course = courses[i];
        if (course) {
            return {
                label: course.title.split(' ')[0].substring(0, 6) + (course.title.length > 6 ? '..' : ''),
                fullTitle: course.title,
                value: course.progressPercent,
                color: i % 2 === 0 ? 'bg-[#DED7FF]' : 'bg-[#8B7AFF]',
            };
        }
        return { label: '-', fullTitle: 'Belum Ada', value: 0, color: i % 2 === 0 ? 'bg-[#DED7FF]' : 'bg-[#8B7AFF]' };
    });

    return (
        <div className="flex flex-col xl:flex-row w-full gap-8 pb-10">
            {/* Left Area: The Main Course Grid (70%) */}
            <div className="flex-1 min-w-0 space-y-8">
                <StudentTopbar />

                {/* Banner Area */}
                <div className="bg-[#696EFF] rounded-2xl p-6 text-white relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden shadow-sm">
                    <div className="relative z-10 pl-2">
                        <p className="text-[10px] font-bold text-white/80 mb-1 tracking-widest uppercase">
                            DASHBOARD
                        </p>
                        <h1 className="text-2xl font-bold">Kelas Saya</h1>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="relative">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as 'ALL' | 'IN_PROGRESS' | 'COMPLETED')}
                                className="appearance-none bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors text-gray-700 text-[13px] font-bold rounded-xl pl-4 pr-10 h-10 focus:outline-none focus:ring-2 focus:ring-[#8B7AFF]/20 focus:border-[#8B7AFF] cursor-pointer"
                            >
                                <option value="ALL">Semua Filter</option>
                                <option value="IN_PROGRESS">Sedang Belajar</option>
                                <option value="COMPLETED">Selesai</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>

                        <div className="flex items-center bg-white border border-gray-100 shadow-sm rounded-xl p-1 h-10 gap-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-2.5 h-full rounded-lg flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-[#F3F0FF] text-[#8B7AFF]' : 'bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-2.5 h-full rounded-lg flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-[#F3F0FF] text-[#8B7AFF]' : 'bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 1: Lanjutkan Belajar (Active Enrollments) */}
                <div className="flex items-center justify-between mt-8 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Lanjutkan Belajar</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredCourses.length}</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[20px] p-4 h-80 animate-pulse border border-gray-100">
                                <div className="w-full h-40 bg-gray-100 rounded-xl mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded-full w-24 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded-full w-1/2 mt-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlayCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] mb-1">Daftar kelas kamu masih kosong</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">Cari dan daftar kelas pertamamu sekarang.</p>
                        <Link href="/kursus" className="inline-block px-6 py-2.5 bg-[#425a8b] text-white rounded-lg font-bold hover:bg-[#344870] transition-colors text-sm">
                            Cari Kelas
                        </Link>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium text-md">Tidak ada kelas di kategori ini.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"}>
                        {filteredCourses.map((course: any) => (
                            <CourseCard key={course.id} course={course} viewMode={viewMode} selectedCourseId={selectedCourseId} onClick={() => setSelectedCourseId(course.id)} />
                        ))}
                    </div>
                )}

                {/* Section 2: Tersedia di Paket Kamu (Available Subscriptions) */}
                {(availableCourses?.length > 0 || loadingAvailable) && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex flex-col mb-6">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-lg font-bold text-gray-900">Tersedia di Paket Kamu</h2>
                                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{availableCourses?.length || 0}</span>
                            </div>
                            <p className="text-sm text-gray-500">Kelas-kelas ini termasuk dalam paket langgananmu dan siap dipelajari.</p>
                        </div>

                        {loadingAvailable ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/50 rounded-[20px] p-4 h-80 animate-pulse border border-dashed border-gray-200">
                                        <div className="w-full h-40 bg-gray-100 rounded-xl mb-4"></div>
                                        <div className="h-3 bg-gray-200 rounded-full w-24 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={viewMode === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"}>
                                {availableCourses.map((course: any) => (
                                    <CourseCard key={course.id} course={course} viewMode={viewMode} isAvailable={true} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Area: Sidebar Content / Data Analytics (30%) */}
            <div className="w-full xl:w-[340px] flex-shrink-0 space-y-6 flex flex-col hidden xl:flex">
                {/* Top Header Match Menu Height */}
                <div className="flex items-center justify-start gap-5 h-12 mb-2 px-2">
                    <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <Mail className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative bg-white shadow-sm">
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        <Bell className="w-4 h-4" />
                    </button>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm">{profile?.name ? profile.name.split(' ')[0] : '...'}</span>
                            {stats?.subscription?.isSubscriber && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#696EFF]">
                                    {stats.subscription.tier === 'PROFESIONAL' ? 'Pro' : stats.subscription.tier === 'MURID' ? 'Murid' : 'Biasa'} Plan
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-8">
                    {/* 1. Overall Progress Board */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[17px] font-bold text-gray-900">Progress Kelas</h2>
                        </div>
                        <div className="bg-[#FAFAFA] rounded-[32px] p-6 border border-gray-50 flex flex-col w-full">
                            <div className="w-full mb-8 flex justify-between items-end px-1">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">Aktivitas Belajar</h3>
                                    <p className="text-xs font-semibold text-gray-400">Rerata Progress Kelas</p>
                                </div>
                                <span className="text-2xl font-black text-[#8B7AFF] mt-1">{courses.length > 0 ? Math.round(courses.reduce((acc: any, c: any) => acc + c.progressPercent, 0) / courses.length) : 0}%</span>
                            </div>

                            {/* Bar Chart Area */}
                            <div className="relative w-full h-[180px] mt-2 group/chart">
                                {/* Horizontal Guidelines */}
                                <div className="absolute inset-0 flex flex-col justify-between z-0 pointer-events-none">
                                    {[100, 75, 50, 25, 0].map((tick, i) => (
                                        <div key={i} className="flex items-center w-full">
                                            <span className="text-[10px] font-bold text-gray-400 w-8 text-left bg-transparent z-10">{tick}%</span>
                                            <div className="flex-1 h-px border-b-2 border-dashed border-gray-200 ml-1"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bars Container */}
                                <div className="absolute inset-0 pt-[10px] pb-[9px] pl-10 pr-2 flex items-end justify-between z-10 gap-3">
                                    {chartData.map((item, index) => (
                                        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group/bar relative cursor-pointer" title={`${item.fullTitle}: ${item.value}%`}>
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 bg-gray-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none shadow-xl">
                                                {item.fullTitle}: {item.value}%
                                            </div>
                                            {/* Bar Element */}
                                            <div
                                                className={`w-full max-w-[36px] rounded-t-lg transition-all duration-700 ease-out ${item.color} shadow-sm group-hover/bar:brightness-110 mb-[-1px] relative`}
                                                style={{ height: `${Math.max(4, item.value)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-lg"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* X-Axis Labels */}
                            <div className="w-full pl-10 pr-2 flex justify-between mt-3 z-10 relative gap-3">
                                {chartData.map((item, index) => (
                                    <span key={index} className="text-[10px] font-bold text-gray-500 w-full text-center truncate">
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Target Fokus Belajar */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[17px] font-bold text-gray-900">Target Belajar</h2>
                            {courses.filter((c: any) => c.progressPercent < 100).length > 0 ? (
                                <span className="bg-[#F3F0FF] text-[#8B7AFF] text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                    IN PROGRESS
                                </span>
                            ) : null}
                        </div>

                        {courses.filter((c: any) => c.progressPercent < 100).length === 0 ? (
                            <div className="text-center py-6 bg-white rounded-[24px] border border-gray-50/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs font-medium text-gray-500">Semua kelas sudah selesai!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {(courses.filter((c: any) => c.progressPercent < 100 && c.progressPercent > 0).length > 0
                                    ? courses.filter((c: any) => c.progressPercent < 100 && c.progressPercent > 0).sort((a: any, b: any) => b.progressPercent - a.progressPercent).slice(0, 3)
                                    : courses.filter((c: any) => c.progressPercent === 0).slice(0, 3)
                                ).map((course: any) => (
                                    <div key={course.id} className="flex items-center p-3.5 bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCourseId(course.id)}>
                                        <div className="relative w-10 h-10 rounded-[14px] overflow-hidden shrink-0 mr-3 border border-gray-100 bg-gray-50">
                                            {course.thumbnailUrl ? (
                                                <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><PlayCircle className="w-5 h-5 text-gray-400" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-[13px] font-bold text-gray-900 truncate">{course.title}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    {course.progressPercent > 0 ? `${course.completedLessons}/${course.totalLessons} Materi` : 'Baru Mulai'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 flex flex-col items-end">
                                            <span className={`text-[13px] font-extrabold ${course.progressPercent > 0 ? 'text-[#8B7AFF]' : 'text-gray-400'}`}>{course.progressPercent}%</span>
                                            <div className="w-12 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                <div className={`h-full rounded-full ${course.progressPercent > 0 ? 'bg-[#8B7AFF]' : 'bg-gray-300'}`} style={{ width: `${Math.max(5, course.progressPercent)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Certificate Showcase */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[17px] font-bold text-gray-900">Sertifikat</h2>
                        </div>

                        {!activeCourse || activeCourse.progressPercent < 100 ? (
                            <div className="bg-[#FAFAFA] rounded-[32px] p-6 text-center px-4 relative overflow-hidden border border-gray-50">
                                <Lock className="w-8 h-8 text-gray-300 mx-auto mb-3 relative z-10" />
                                <h4 className="text-sm font-bold text-gray-900 mb-1 relative z-10">Belum Terbuka</h4>
                                <p className="text-xs font-medium text-gray-500 relative z-10 leading-relaxed">Selesaikan kelas ini hingga 100% untuk membuka sertifikat kelulusan.</p>
                            </div>
                        ) : (
                            <div className="relative bg-[#A855F7] rounded-[32px] p-5 text-white overflow-hidden group shadow-md hover:shadow-lg hover:shadow-[#A855F7]/30 transition-all duration-300">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-500"></div>

                                <div className="relative z-10 flex flex-col items-start">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                        <Trophy className="w-5 h-5 text-yellow-300" />
                                    </div>
                                    <h4 className="font-bold text-[15px] leading-snug line-clamp-2 mb-1 pl-0.5">{activeCourse.title}</h4>
                                    <p className="text-[11px] font-medium text-purple-200 mb-6 pl-0.5">Sertifikat Resmi Luminus</p>

                                    <div className="flex items-center gap-2.5 w-full mt-auto">
                                        <button
                                            onClick={() => handlePreviewCert(activeCourse.id)}
                                            disabled={isPreviewLoading}
                                            className="flex-1 py-2.5 bg-white/10 hover:bg-white text-white hover:text-[#A855F7] text-xs font-bold rounded-[12px] flex items-center justify-center gap-1.5 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPreviewLoading ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Eye className="w-3.5 h-3.5" />
                                            )}
                                            Preview
                                        </button>
                                        <CertificateDownloader
                                            courseId={activeCourse.id}
                                            userId={activeCourse.userId}
                                            variant="custom"
                                            className="flex-1 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-[12px] flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md shadow-black/20 border border-black/5 hover:scale-[1.02]"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Unduh
                                        </CertificateDownloader>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Live Preview Modal */}
            {isPreviewOpen && previewCertData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="relative w-[95vw] md:w-[85vw] max-w-[1200px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <Award className="w-5 h-5 text-[#8B7AFF]" /> Pratinjau Sertifikat
                            </h3>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center relative min-h-[400px]">
                            {/* We use scale transformations to fit the large certificate in smaller screens without breaking its absolute layout */}
                            <div className="transform scale-[0.35] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.75] xl:scale-[0.85] origin-center shrink-0 flex items-center justify-center transition-transform">
                                <CertificateTemplate
                                    studentName={previewCertData.studentName}
                                    courseTitle={previewCertData.courseTitle}
                                    completionDate={previewCertData.completionDate}
                                    certificateId={previewCertData.certificateId}
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 items-center">
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                Tutup
                            </button>
                            <CertificateDownloader
                                courseId={previewCertData.courseId || (activeCourse?.id ?? "")}
                                userId={activeCourse?.userId || ""}
                                variant="primary"
                                className="rounded-xl px-6 py-2.5 h-auto text-sm w-auto shadow-md"
                                triggerButtonText="Unduh Resolusi Penuh"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
