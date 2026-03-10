"use client";

import { BookOpenCheck, Trophy, CreditCard, Hourglass, ChevronLeft, ChevronRight, MoreVertical, Bell, Mail, User, Play, GraduationCap, PlayCircle, Bot, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import StudentTopbar from "@/components/dashboard/StudentTopbar";
import AiMentorChat from "@/components/dashboard/AiMentorChat";
import { useDashboardOverview, useStudentProfile } from "@/hooks/use-dashboard";

interface CourseData {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    enrolledAt: string;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
}

interface DashboardStats {
    activeCourses: number;
    completedLessons: number;
    totalTransactions: number;
    pendingTransactions: number;
    recentCourses: CourseData[];
    subscription?: any;
}

export default function StudentOverviewPage() {
    const { stats: fetchedStats, isLoading: loading } = useDashboardOverview();
    const { profile } = useStudentProfile();
    const stats: DashboardStats = fetchedStats || {
        activeCourses: 0,
        completedLessons: 0,
        totalTransactions: 0,
        pendingTransactions: 0,
        recentCourses: [],
        subscription: null,
    };

    const recentCourses = stats.recentCourses || [];

    return (
        <div className="flex flex-col xl:flex-row w-full gap-8 pb-10">
            {/* Left Main Content */}
            <div className="flex-1 space-y-8">
                <StudentTopbar />
                {/* Hero Banner */}
                <div className="bg-[#696EFF] rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-[0_10px_40px_-10px_rgba(105,110,255,0.4)]">
                    <div className="relative z-10 md:w-3/4">
                        <p className="text-xs font-medium text-white/80 mb-3 tracking-widest uppercase">
                            ONLINE COURSE
                        </p>
                        <h1 className="text-3xl md:text-[34px] font-bold mb-6 leading-tight max-w-lg">
                            Sharpen Your Skills With Professional Online Courses
                        </h1>
                        <Link
                            href="/kursus"
                            className="inline-flex items-center gap-3 bg-[#111111] text-white px-5 py-2.5 text-sm rounded-full font-medium hover:bg-black transition-colors"
                        >
                            Join Now
                            <div className="bg-white text-black p-1 rounded-full">
                                <Play className="w-3 h-3 fill-black ml-0.5" />
                            </div>
                        </Link>
                    </div>
                    {/* Decorative stars/shapes */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 flex items-center justify-center pointer-events-none">
                        <svg viewBox="0 0 200 200" className="w-64 h-64 text-white fill-current animate-pulse duration-3000">
                            <path d="M100 0L122 78L200 100L122 122L100 200L78 122L0 100L78 78L100 0Z" />
                        </svg>
                    </div>
                </div>

                {/* Quick Stats Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#8B7AFF]">
                                <BookOpenCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Kelas Aktif</p>
                                <p className="text-sm font-bold text-gray-900">{stats.activeCourses} Kelas</p>
                            </div>
                        </div>
                        <MoreVertical className="w-5 h-5 text-gray-300" />
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#8B7AFF]">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Materi Selesai</p>
                                <p className="text-sm font-bold text-gray-900">{stats.completedLessons} Materi</p>
                            </div>
                        </div>
                        <MoreVertical className="w-5 h-5 text-gray-300" />
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#8B7AFF]">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Total Transaksi</p>
                                <p className="text-sm font-bold text-gray-900">{stats.totalTransactions} Order</p>
                            </div>
                        </div>
                        <MoreVertical className="w-5 h-5 text-gray-300" />
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#8B7AFF]">
                                <Hourglass className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Tertunda</p>
                                <p className="text-sm font-bold text-gray-900">{stats.pendingTransactions} Tagihan</p>
                            </div>
                        </div>
                        <MoreVertical className="w-5 h-5 text-gray-300" />
                    </div>
                </div>

                {/* Continue Watching Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Lanjutkan Belajar</h2>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow-sm">
                                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded-full w-24 mb-3"></div>
                                    <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-4"></div>
                                    <div className="h-8 bg-gray-100 rounded-full w-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : recentCourses.length === 0 ? (
                        <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
                            <p className="text-gray-500 mb-4">Belum ada kelas yang dipelajari.</p>
                            <Link href="/kursus" className="text-[#696EFF] font-medium hover:underline">
                                Mulai cari kelas
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentCourses.map((course: CourseData) => (
                                <div key={course.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all group">
                                    <Link href={`/kursus/${course.slug}/belajar`} className="block">
                                        <div className="h-40 relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                                            {course.thumbnailUrl ? (
                                                <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                                    <PlayCircle className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="inline-block px-2.5 py-1 bg-[#F3F0FF] text-[#8B7AFF] text-[10px] font-semibold rounded-md mb-3 uppercase tracking-wider">
                                            KURSUS
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-5 line-clamp-2 leading-tight min-h-[44px]">
                                            {course.title}
                                        </h3>

                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${course.progressPercent === 100 ? 'bg-green-500' : 'bg-[#696EFF]'}`}
                                                style={{ width: `${course.progressPercent}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#8B7AFF] flex-shrink-0">
                                                {course.progressPercent === 100 ? (
                                                    <Trophy className="w-4 h-4" />
                                                ) : (
                                                    <GraduationCap className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-semibold text-gray-900">
                                                    {course.progressPercent === 100 ? 'Selesai' : 'Progres Belajar'}
                                                </p>
                                                <p className="text-gray-500">
                                                    {course.completedLessons} dari {course.totalLessons} materi diselesaikan
                                                </p>
                                            </div>
                                        </div>

                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity / Mentor list styling */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Aktivitas Terkini</h2>
                        <Link href="/dashboard/courses" className="text-sm text-[#696EFF] font-medium hover:underline">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-400 text-xs font-semibold uppercase border-b border-gray-50">
                                    <th className="pb-4 font-semibold">Nama Kelas & Tanggal</th>
                                    <th className="pb-4 font-semibold">Status</th>
                                    <th className="pb-4 font-semibold">Progress</th>
                                    <th className="pb-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">Loading...</td>
                                    </tr>
                                ) : recentCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">Belum ada kelas terbaru</td>
                                    </tr>
                                ) : (
                                    recentCourses.map((course: CourseData) => (
                                        <tr key={`table-${course.id}`} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0">
                                                        {course.thumbnailUrl && <Image src={course.thumbnailUrl} alt="" fill className="object-cover" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 line-clamp-1">{course.title}</p>
                                                        <p className="text-xs text-gray-400">{format(new Date(course.enrolledAt), 'dd/MM/yyyy')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className="inline-block px-3 py-1 bg-purple-50 text-[#696EFF] text-[10px] font-bold rounded-full uppercase">
                                                    AKTIF
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <p className="text-gray-600 font-medium text-sm">{course.progressPercent}% Selesai</p>
                                            </td>
                                            <td className="py-4 text-right">
                                                <Link
                                                    href={`/kursus/${course.slug}/belajar`}
                                                    className="inline-block px-4 py-2 bg-[#696EFF]/10 text-[#696EFF] text-xs font-bold rounded-full hover:bg-[#696EFF] hover:text-white transition-colors"
                                                >
                                                    LANJUTKAN
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Profile Column */}
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
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm">{profile?.name ? profile.name.split(' ')[0] : '...'}</span>
                            {stats.subscription?.isSubscriber && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#696EFF]">
                                    {stats.subscription.tier === 'PROFESIONAL' ? 'Pro' : stats.subscription.tier === 'MURID' ? 'Murid' : 'Biasa'} Plan
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Unified Right Sidebar Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-8">
                    <div>
                        {/* Avatar Progress (Removed Statistic header) */}
                        <div className="flex justify-center mb-6 relative mt-2">
                            <div className="relative w-[130px] h-[130px]">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="#F4F4F5" strokeWidth="4" />
                                    {(() => {
                                        const totalProgress = recentCourses.length > 0
                                            ? Math.round(recentCourses.reduce((acc: number, curr: CourseData) => acc + curr.progressPercent, 0) / recentCourses.length)
                                            : 0;
                                        const dashOffset = 289 - (289 * (totalProgress / 100));
                                        return (
                                            <>
                                                <circle cx="50" cy="50" r="46" fill="transparent" stroke="#A855F7" strokeWidth="4" strokeDasharray="289" strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000" />
                                                {/* Percentage Badge */}
                                                <div className="absolute top-1 -right-2 bg-[#A855F7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-10">
                                                    {totalProgress}%
                                                </div>
                                            </>
                                        );
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center p-2.5">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Greeting */}
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-1.5 flex items-center justify-center gap-1.5">
                                Good Morning {profile?.name ? profile.name.split(' ')[0] : '...'} 🤠
                            </h3>
                            <p className="text-[13px] text-gray-500 font-medium">Continue your learning to achieve your target!</p>
                        </div>

                        {/* Dynamic Chart Box */}
                        <div className="bg-[#FAFAFA] rounded-[24px] p-5 relative border border-gray-50">
                            {(() => {
                                const maxVal = Math.max(stats.activeCourses, stats.completedLessons, stats.totalTransactions, stats.pendingTransactions, 10);
                                return (
                                    <div className="flex h-32 relative">
                                        {/* Y-axis */}
                                        <div className="flex flex-col justify-between text-[10px] text-gray-400 font-medium pb-5 pr-3 items-end w-8 shrink-0">
                                            <span>{maxVal}</span>
                                            <span>{Math.floor(maxVal / 2)}</span>
                                            <span>0</span>
                                        </div>
                                        {/* Graph Box */}
                                        <div className="flex-1 relative">
                                            <div className="absolute top-[0%] w-full border-t border-dashed border-gray-200"></div>
                                            <div className="absolute top-[50%] -mt-[1px] w-full border-t border-dashed border-gray-200"></div>
                                            <div className="absolute bottom-[20px] w-full border-t border-dashed border-gray-200"></div>

                                            <div className="absolute bottom-[20px] left-0 w-full h-[calc(100%-20px)] flex items-end justify-between px-2 gap-2">
                                                {[
                                                    { val: stats.activeCourses, label: 'Kelas', color: 'bg-[#E9D5FF]', hover: 'group-hover:bg-[#A855F7]' },
                                                    { val: stats.completedLessons, label: 'Materi', color: 'bg-[#A855F7]', hover: 'group-hover:bg-[#8B5CF6]' },
                                                    { val: stats.totalTransactions, label: 'Order', color: 'bg-[#E9D5FF]', hover: 'group-hover:bg-[#A855F7]' },
                                                    { val: stats.pendingTransactions, label: 'Pending', color: 'bg-[#E9D5FF]', hover: 'group-hover:bg-[#A855F7]' }
                                                ].map((item, i) => {
                                                    const heightPercent = Math.max((item.val / maxVal) * 100, 5);
                                                    return (
                                                        <div key={i} className="w-1/4 h-full flex flex-col items-center justify-end relative group">
                                                            <div
                                                                className={`w-full rounded-md transition-all duration-300 ${item.color} ${item.hover}`}
                                                                style={{ height: `${heightPercent}%` }}
                                                            ></div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="absolute bottom-[-18px] left-0 w-full flex justify-between px-1">
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium">Kelas</span>
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium whitespace-nowrap -ml-1">Materi</span>
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium">Order</span>
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium whitespace-nowrap pl-1">Pending</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="h-2"></div>
                        </div>
                    </div>

                    {/* Priority Classes */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[17px] font-bold text-gray-900">Kelas Prioritas</h2>
                            <Link
                                href="/dashboard/courses"
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#A855F7] hover:bg-purple-50 transition-colors"
                            >
                                <span className="text-lg leading-none mt-[-2px]">+</span>
                            </Link>
                        </div>

                        <div className="bg-[#FAFAFA] rounded-[32px] p-4 border border-gray-50">
                            <div className="space-y-3">
                                {recentCourses.slice(0, 3).map((course: CourseData) => (
                                    <div key={course.id} className="flex items-center justify-between bg-white p-2.5 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50/50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative bg-gray-50">
                                                {course.thumbnailUrl ? (
                                                    <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                                                ) : (
                                                    <PlayCircle className="w-5 h-5 text-gray-300 absolute inset-0 m-auto" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900 line-clamp-1 max-w-[100px]">{course.title}</p>
                                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{course.progressPercent}% Selesai</p>
                                            </div>
                                        </div>
                                        <Link href={`/kursus/${course.slug}/belajar`} className="px-3 py-1.5 rounded-[12px] border border-[#E9D5FF] text-[#A855F7] text-xs font-semibold hover:bg-[#A855F7] hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0">
                                            <Play className="w-[10px] h-[10px] fill-current" />
                                            Lanjut
                                        </Link>
                                    </div>
                                ))}
                                {recentCourses.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4 font-medium">Belum ada kelas aktif</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* VIP Community Card */}
                    {!loading && (
                        <div className="mt-4">
                            <div className={`rounded-[24px] p-6 border relative overflow-hidden flex flex-col items-center text-center ${stats.subscription?.isSubscriber ? 'bg-[#111111] text-white border-transparent shadow-lg' : 'bg-white border-gray-100'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 z-10 ${stats.subscription?.isSubscriber ? 'bg-[#2b2b2b] text-white' : 'bg-[#F3F0FF] text-[#8B7AFF]'}`}>
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <h3 className={`text-lg font-bold mb-2 z-10 ${stats.subscription?.isSubscriber ? 'text-white' : 'text-gray-900'}`}>VIP Community</h3>
                                <p className={`text-xs font-medium mb-6 z-10 ${stats.subscription?.isSubscriber ? 'text-white/70' : 'text-gray-500'}`}>
                                    {stats.subscription?.isSubscriber
                                        ? "Akses eksklusif grup Discord untuk tanya jawab langsung dengan mentor dan peers."
                                        : "Tingkatkan langganan untuk masuk ke komunitas premium kami."}
                                </p>
                                <div className="z-10 w-full">
                                    {stats.subscription?.isSubscriber ? (
                                        stats.subscription?.communityUrl ? (
                                            <a
                                                href={stats.subscription.communityUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block w-full py-2.5 rounded-full bg-[#696EFF] text-white text-sm font-semibold hover:bg-[#585cee] transition-colors"
                                            >
                                                Join Server Discord
                                            </a>
                                        ) : (
                                            <span className="block w-full py-2.5 rounded-full border border-white/20 text-white/50 text-sm font-semibold">
                                                Link Belum Tersedia
                                            </span>
                                        )
                                    ) : (
                                        <Link
                                            href="/pricing"
                                            className="block w-full py-2.5 rounded-full bg-[#8B7AFF] text-white text-sm font-semibold hover:bg-[#7a6aee] transition-colors"
                                        >
                                            Upgrade Langganan
                                        </Link>
                                    )}
                                </div>

                                {/* Abstract background elements if subscriber */}
                                {stats.subscription?.isSubscriber && (
                                    <>
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#696EFF] rounded-full blur-[40px] opacity-20"></div>
                                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#A855F7] rounded-full blur-[40px] opacity-20"></div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
