"use client";

import { User, Mail, Bell, Camera, Edit3, Loader2, Play, PlayCircle, MessageCircle } from "lucide-react";
import StudentTopbar from "@/components/dashboard/StudentTopbar";
import Link from "next/link";
import { useDashboardOverview } from "@/hooks/use-dashboard";
import { useSettings } from "@/hooks/use-settings";

export default function StudentSettingsPage() {
    const { stats } = useDashboardOverview();
    const {
        loading, saving, uploading, formData, isDirty,
        fileInputRef, handleChange, handleAvatarChange, handleSubmit, resetForm,
    } = useSettings();

    if (loading) {
        return (
            <div className="flex flex-col xl:flex-row w-full gap-8 pb-10 animate-pulse">
                <div className="flex-1 space-y-6">
                    <div className="h-12 bg-gray-100 rounded-2xl" />
                    <div className="h-32 bg-gray-100 rounded-[28px]" />
                    <div className="h-64 bg-gray-100 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row w-full gap-8 pb-10">
            {/* ── LEFT MAIN ── */}
            <div className="flex-1 space-y-6">
                <StudentTopbar />

                {/* Purple header — same pattern as Kursus Saya page */}
                <div className="bg-[#696EFF] rounded-[28px] px-8 py-6 text-white relative overflow-hidden flex items-center justify-between shadow-[0_10px_40px_-10px_rgba(105,110,255,0.4)]">
                    <div className="relative z-10">
                        <p className="text-xs font-medium text-white/70 tracking-widest uppercase mb-1">DASHBOARD</p>
                        <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
                    </div>
                    {/* Decorative dots grid */}
                    <div className="absolute right-6 top-0 bottom-0 w-[180px] pointer-events-none flex items-center justify-end overflow-hidden opacity-25">
                        <svg viewBox="0 0 120 100" className="w-full h-full fill-white">
                            {Array.from({ length: 6 }).map((_, row) =>
                                Array.from({ length: 8 }).map((_, col) => (
                                    <circle
                                        key={`${row}-${col}`}
                                        cx={col * 16 + 8}
                                        cy={row * 16 + 8}
                                        r={row % 2 === col % 2 ? 2 : 1.2}
                                    />
                                ))
                            )}
                        </svg>
                    </div>
                </div>

                {/* Main Form Card */}
                <form onSubmit={handleSubmit} className="max-w-4xl space-y-0">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

                        {/* ── PROFILE PHOTO SECTION ── */}
                        <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-5">
                            {/* Avatar */}
                            <div
                                className="relative group cursor-pointer shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" ref={fileInputRef} hidden
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleAvatarChange}
                                />
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-7 h-7 text-[#8B7AFF]/60" />
                                    )}
                                    {uploading ? (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm rounded-full">
                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-5 h-5 border-2 border-white bg-green-400 rounded-full flex items-center justify-center shadow">
                                    <Edit3 className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>

                            {/* Name + plan */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-[15px] truncate">{formData.name || "Pelajar Luminus"}</p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{formData.email}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="shrink-0 px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-xs rounded-full hover:bg-gray-50 transition-colors hidden sm:block"
                            >
                                Ganti Foto
                            </button>
                        </div>

                        {/* ── NAMA LENGKAP ── */}
                        <div className="px-6 py-5 border-b border-gray-50">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Masukkan nama lengkap"
                                className="w-full max-w-xl bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none hover:border-gray-300 focus:border-[#696EFF] focus:ring-4 focus:ring-[#696EFF]/10 transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* ── EMAIL ── */}
                        <div className="px-6 py-5 border-b border-gray-50">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="email@contoh.com"
                                className="w-full max-w-xl bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none hover:border-gray-300 focus:border-[#696EFF] focus:ring-4 focus:ring-[#696EFF]/10 transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* ── PASSWORD ── */}
                        <div className="px-6 py-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                            <p className="text-xs text-gray-400 font-medium mb-3">Biarkan kosong jika tidak ingin mengganti</p>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Masukkan password baru"
                                className="w-full max-w-xl bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none hover:border-gray-300 focus:border-[#696EFF] focus:ring-4 focus:ring-[#696EFF]/10 transition-all placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className={`transition-all duration-300 mt-4 ${isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-400 hidden sm:block">Ada perubahan yang belum disimpan</p>
                            <div className="flex gap-3 ml-auto">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-5 py-2.5 border border-gray-200 text-gray-500 font-bold text-sm rounded-full hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-6 py-2.5 bg-[#696EFF] text-white font-bold text-sm rounded-full shadow-md shadow-[#696EFF]/20 hover:bg-[#585cee] hover:-translate-y-0.5 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="w-full xl:w-[340px] flex-shrink-0 space-y-6 hidden xl:flex flex-col">
                {/* Header matching dashboard */}
                <div className="flex items-center justify-start gap-5 h-12 mb-2 px-2">
                    <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <Mail className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center relative text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        <Bell className="w-4 h-4" />
                    </button>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
                            {formData.avatarUrl
                                ? <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                : <User className="w-5 h-5 text-gray-400" />
                            }
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm">{formData.name ? formData.name.split(' ')[0] : 'Pelajar'}</span>
                            {stats?.subscription?.isSubscriber && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#696EFF]">
                                    {stats.subscription.tier === 'PROFESIONAL' ? 'Pro' : stats.subscription.tier === 'MURID' ? 'Murid' : 'Biasa'} Plan
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Unified Sidebar Card — same as dashboard */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-8">

                    {/* Avatar Progress Ring + Greeting */}
                    <div>
                        <div className="flex justify-center mb-6 relative mt-2">
                            <div className="relative w-[130px] h-[130px]">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="#F4F4F5" strokeWidth="4" />
                                    {(() => {
                                        const recentCourses = stats?.recentCourses || [];
                                        const totalProgress = recentCourses.length > 0
                                            ? Math.round(recentCourses.reduce((acc: number, c: any) => acc + c.progressPercent, 0) / recentCourses.length)
                                            : 0;
                                        const dashOffset = 289 - (289 * (totalProgress / 100));
                                        return (
                                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="#A855F7" strokeWidth="4"
                                                strokeDasharray="289" strokeDashoffset={dashOffset}
                                                strokeLinecap="round" className="transition-all duration-1000" />
                                        );
                                    })()}
                                </svg>
                                <div className="absolute top-1 -right-2 bg-[#A855F7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-10">
                                    {stats?.recentCourses && stats.recentCourses.length > 0
                                        ? Math.round(stats.recentCourses.reduce((a: number, c: any) => a + c.progressPercent, 0) / stats.recentCourses.length)
                                        : 0}%
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center p-2.5">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center">
                                        {formData.avatarUrl
                                            ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            : <User className="w-12 h-12 text-gray-300" />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1.5">
                                Hai, {formData.name ? formData.name.split(' ')[0] : '...'} 👋
                            </h3>
                            <p className="text-[13px] text-gray-500 font-medium">Kelola profil dan keamanan akunmu di sini.</p>
                        </div>

                        {/* Mini Stats Chart */}
                        <div className="bg-[#FAFAFA] rounded-[24px] p-5 border border-gray-50">
                            {(() => {
                                const maxVal = Math.max(stats?.activeCourses || 0, stats?.completedCourses || 0, stats?.totalTransactions || 0, 1);
                                return (
                                    <div className="flex h-28 relative">
                                        <div className="flex flex-col justify-between text-[10px] text-gray-400 font-medium pb-5 pr-3 items-end w-8 shrink-0">
                                            <span>{maxVal}</span><span>{Math.floor(maxVal / 2)}</span><span>0</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <div className="absolute top-[0%] w-full border-t border-dashed border-gray-200" />
                                            <div className="absolute top-[50%] w-full border-t border-dashed border-gray-200" />
                                            <div className="absolute bottom-[20px] w-full border-t border-dashed border-gray-200" />
                                            <div className="absolute bottom-[20px] left-0 w-full h-[calc(100%-20px)] flex items-end justify-between px-2 gap-2">
                                                {[
                                                    { val: stats?.activeCourses || 0, color: 'bg-[#E9D5FF]', hover: 'group-hover:bg-[#A855F7]' },
                                                    { val: stats?.completedCourses || 0, color: 'bg-[#A855F7]', hover: 'group-hover:bg-[#8B5CF6]' },
                                                    { val: stats?.totalTransactions || 0, color: 'bg-[#E9D5FF]', hover: 'group-hover:bg-[#A855F7]' },
                                                    { val: stats?.pendingTransactions || 0, color: 'bg-[#E9D5FF]', hover: 'group-hover:bg-[#A855F7]' },
                                                ].map((item, i) => (
                                                    <div key={i} className="w-1/4 h-full flex flex-col items-center justify-end group">
                                                        <div className={`w-full rounded-md transition-all duration-300 ${item.color} ${item.hover}`}
                                                            style={{ height: `${Math.max((item.val / maxVal) * 100, 5)}%` }} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute bottom-[-18px] left-0 w-full flex justify-between px-1">
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium">Kelas</span>
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium">Selesai</span>
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium">Order</span>
                                                <span className="w-1/4 text-center text-[9px] text-gray-400 font-medium">Pending</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="h-2" />
                        </div>
                    </div>

                    {/* Kelas Prioritas */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-[17px] font-bold text-gray-900">Kelas Prioritas</h2>
                            <Link href="/dashboard/courses"
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#A855F7] hover:bg-purple-50 transition-colors">
                                <span className="text-lg leading-none mt-[-2px]">+</span>
                            </Link>
                        </div>
                        <div className="bg-[#FAFAFA] rounded-[32px] p-4 border border-gray-50">
                            <div className="space-y-3">
                                {(stats?.recentCourses || []).slice(0, 3).map((course: any) => (
                                    <div key={course.id} className="flex items-center justify-between bg-white p-2.5 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50/50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative bg-gray-50">
                                                {course.thumbnailUrl
                                                    ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                                    : <PlayCircle className="w-5 h-5 text-gray-300 absolute inset-0 m-auto" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900 line-clamp-1 max-w-[100px]">{course.title}</p>
                                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{course.progressPercent}% Selesai</p>
                                            </div>
                                        </div>
                                        <Link href={`/kursus/${course.slug}/belajar`}
                                            className="px-3 py-1.5 rounded-[12px] border border-[#E9D5FF] text-[#A855F7] text-xs font-semibold hover:bg-[#A855F7] hover:text-white transition-all flex items-center gap-1.5 shrink-0">
                                            <Play className="w-[10px] h-[10px] fill-current" /> Lanjut
                                        </Link>
                                    </div>
                                ))}
                                {(!stats?.recentCourses || stats.recentCourses.length === 0) && (
                                    <p className="text-sm text-gray-400 text-center py-4 font-medium">Belum ada kelas aktif</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* VIP Community */}
                    {stats && (
                        <div className={`rounded-[24px] p-6 border relative overflow-hidden flex flex-col items-center text-center ${stats.subscription?.isSubscriber ? 'bg-[#111111] text-white border-transparent shadow-lg' : 'bg-white border-gray-100'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 z-10 ${stats.subscription?.isSubscriber ? 'bg-[#2b2b2b] text-white' : 'bg-[#F3F0FF] text-[#8B7AFF]'}`}>
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h3 className={`text-lg font-bold mb-2 z-10 ${stats.subscription?.isSubscriber ? 'text-white' : 'text-gray-900'}`}>VIP Community</h3>
                            <p className={`text-xs font-medium mb-6 z-10 ${stats.subscription?.isSubscriber ? 'text-white/70' : 'text-gray-500'}`}>
                                {stats.subscription?.isSubscriber
                                    ? "Akses eksklusif grup Discord untuk tanya jawab langsung."
                                    : "Upgrade untuk masuk komunitas premium kami."}
                            </p>
                            <div className="z-10 w-full">
                                {stats.subscription?.isSubscriber ? (
                                    stats.subscription?.communityUrl
                                        ? <a href={stats.subscription.communityUrl} target="_blank" rel="noreferrer"
                                            className="block w-full py-2.5 rounded-full bg-[#696EFF] text-white text-sm font-semibold hover:bg-[#585cee] transition-colors">
                                            Join Server Discord
                                          </a>
                                        : <span className="block w-full py-2.5 rounded-full border border-white/20 text-white/50 text-sm font-semibold">Link Belum Tersedia</span>
                                ) : (
                                    <Link href="/pricing"
                                        className="block w-full py-2.5 rounded-full bg-[#8B7AFF] text-white text-sm font-semibold hover:bg-[#7a6aee] transition-colors">
                                        Upgrade Langganan
                                    </Link>
                                )}
                            </div>
                            {stats.subscription?.isSubscriber && (
                                <>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#696EFF] rounded-full blur-[40px] opacity-20" />
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#A855F7] rounded-full blur-[40px] opacity-20" />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


