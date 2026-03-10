"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Save, Bell, Camera, CalendarDays, ShieldCheck, Edit3, CheckCircle, Sparkles, PlayCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import StudentTopbar from "@/components/dashboard/StudentTopbar";
import { invalidateProfile, invalidateDashboard, useDashboardOverview } from "@/hooks/use-dashboard";

export default function StudentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { stats } = useDashboardOverview();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "", // Only sent if user types a new one
        role: "STUDENT",
        createdAt: "",
        avatarUrl: null as string | null,
    });
    const [originalData, setOriginalData] = useState({
        name: "",
        email: "",
    });

    // Check if form has any unsaved changes
    const isDirty = formData.name !== originalData.name || formData.email !== originalData.email || formData.password.trim() !== "";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/student/profile");
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        password: "",
                        role: data.role || "STUDENT",
                        createdAt: data.createdAt ? format(new Date(data.createdAt), "MMMM yyyy", { locale: localeId }) : "",
                        avatarUrl: data.avatarUrl || null,
                    });
                    setOriginalData({
                        name: data.name || "",
                        email: data.email || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Gagal memuat profil");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload - update preview locally immediately
            const imgUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatarUrl: imgUrl }));
            toast.success("Foto profil berhasil diperbarui (Simulasi UX)");
            // Note: In a real app, you would upload this file to S3/Cloudinary/etc. here
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Only send password if it's not empty
            const payload: Record<string, string> = { name: formData.name, email: formData.email };
            if (formData.password.trim() !== "") {
                payload.password = formData.password;
            }

            const res = await fetch("/api/student/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Profil berhasil diperbarui!");
                // Clear password field after save
                setFormData(prev => ({ ...prev, password: "" }));
                setOriginalData({ name: formData.name, email: formData.email });
                // Invalidate SWR caches so sidebar/dashboard show updated name
                invalidateProfile();
                invalidateDashboard();
            } else {
                const data = await res.json();
                toast.error(data.message || "Gagal memperbarui profil");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse space-y-6 max-w-2xl">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>;
    }

    return (
        <div className="flex flex-col xl:flex-row w-full gap-8 pb-10">
            {/* Left Main Content */}
            <div className="flex-1 space-y-8">
                <StudentTopbar />

                <div className="max-w-4xl space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* CARD 1: PROFILE PHOTO */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm flex items-center justify-between overflow-hidden relative">
                            {/* Accent Background Graphic */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8B7AFF]/10 to-purple-100/30 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>

                            <div className="relative z-10 flex items-center gap-8">
                                <div
                                    className="relative group cursor-pointer shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleAvatarChange}
                                    />
                                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-[#8B7AFF]/50" />
                                        )}
                                        <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-8 h-8 border-2 border-white bg-green-500 rounded-full flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform">
                                        <Edit3 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">Profile photo</h2>
                                    <p className="text-gray-500 text-xs max-w-xs leading-relaxed hidden sm:block">
                                        Upload foto terbaikmu. Rekomendasi ukuran 2MB dengan resolusi 1:1 format .png atau .jpg
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: BASIC INFO */}
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative">
                            <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/50 px-6 py-5 border-b border-gray-100/80 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#8B7AFF]">
                                    <User className="w-4 h-4" />
                                </div>
                                <h2 className="text-[15px] font-bold text-indigo-950">Basic information</h2>
                            </div>
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="relative max-w-xl">
                                    <label className="absolute -top-2 left-4 bg-white px-1.5 text-[11px] font-bold text-[#8B7AFF] uppercase tracking-wide">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-3 outline-none hover:border-gray-300 focus:border-[#8B7AFF] focus:ring-4 focus:ring-[#8B7AFF]/10 transition-all text-gray-900 text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: LOGIN INFO */}
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative">
                            <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/50 px-6 py-5 border-b border-gray-100/80 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#8B7AFF]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <h2 className="text-[15px] font-bold text-indigo-950">Login information</h2>
                            </div>
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="relative max-w-xl">
                                    <label className="absolute -top-2 left-4 bg-white px-1.5 text-[11px] font-bold text-[#8B7AFF] uppercase tracking-wide">E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-3 outline-none hover:border-gray-300 focus:border-[#8B7AFF] focus:ring-4 focus:ring-[#8B7AFF]/10 transition-all text-gray-900 text-sm font-medium"
                                    />
                                </div>

                                <div className="relative max-w-xl">
                                    <label className="absolute -top-2 left-4 bg-white px-1.5 text-[11px] font-bold text-[#8B7AFF] uppercase tracking-wide">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="New password (leave blank to keep current)"
                                        className="w-full bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-3 outline-none hover:border-gray-300 focus:border-[#8B7AFF] focus:ring-4 focus:ring-[#8B7AFF]/10 transition-all text-gray-900 text-sm font-medium placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FLOATING ACTION BUTTONS (Only visible when user edits form) */}
                        <div className={`transition-all duration-300 transform ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none hidden'}`}>
                            <div className="flex items-center justify-end gap-3 p-4 mt-2 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, name: originalData.name, email: originalData.email, password: "" });
                                    }}
                                    className="px-6 py-2.5 bg-white border-[1.5px] border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-6 py-2.5 bg-[#8B7AFF] text-white font-bold text-sm rounded-xl shadow-md shadow-[#8B7AFF]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                                >
                                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Profile Column (Copied layout from dashboard) */}
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
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-gray-400" />
                            )}
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

                {/* Unified Right Sidebar Card (Marketing) */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-8">
                    {/* Section 1: Promo Upsell Layout as Real Product Card */}
                    <div className="pt-2">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4 px-1">
                            <span>PRO CLASSES</span>
                            <span className="flex-1 h-px bg-gray-100"></span>
                        </h3>

                        <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
                            {/* Realistic Thumbnail Area */}
                            <div className="h-36 w-full relative bg-gray-50 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                                    <PlayCircle className="w-10 h-10 text-white/80" />
                                </div>
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-sm">
                                    50% OFF
                                </div>
                            </div>

                            {/* Card Content Area */}
                            <div className="p-4 flex flex-col justify-between">
                                <div className="mb-4">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1 leading-snug line-clamp-2">Mastering UI/UX Design Pro</h4>
                                    <p className="text-[11px] text-gray-500 font-medium">By Angga Risky</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-400 line-through font-medium leading-none">Rp 998.000</p>
                                        <p className="text-[13px] font-bold text-[#8B7AFF] mt-1 leading-none">Rp 499.000</p>
                                    </div>
                                    <button className="px-3 py-1.5 bg-[#F3F0FF] text-[#8B7AFF] rounded-lg text-[11px] font-bold group-hover:bg-[#8B7AFF] group-hover:text-white transition-colors">
                                        Klaim
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Recommendations with flat clean layout */}
                    <div>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-5 px-1">
                            <span>RECOMMENDED</span>
                            <span className="flex-1 h-px bg-gray-100"></span>
                        </h3>

                        <div className="bg-[#FAFAFA] rounded-[32px] p-4 border border-gray-50">
                            <div className="space-y-3">
                                {/* Item 1 */}
                                <div className="flex items-center justify-between bg-white p-2.5 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50/50 group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative bg-gray-50">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#8B7AFF] to-blue-500 group-hover:scale-105 transition-transform flex items-center justify-center">
                                                <PlayCircle className="w-5 h-5 text-white/90" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-900 group-hover:text-[#8B7AFF] transition-colors line-clamp-1 max-w-[100px]">Next.js Master</p>
                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Rp 499k</p>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 rounded-[12px] border border-[#E9D5FF] text-[#A855F7] text-xs font-semibold group-hover:bg-[#A855F7] group-hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0">
                                        <Play className="w-[10px] h-[10px] fill-current" />
                                        Beli
                                    </button>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-center justify-between bg-white p-2.5 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50/50 group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative bg-gray-50">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-105 transition-transform flex items-center justify-center">
                                                <PlayCircle className="w-5 h-5 text-white/90" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-900 group-hover:text-[#8B7AFF] transition-colors line-clamp-1 max-w-[100px]">React Native Pro</p>
                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Rp 299k</p>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 rounded-[12px] border border-[#E9D5FF] text-[#A855F7] text-xs font-semibold group-hover:bg-[#A855F7] group-hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0">
                                        <Play className="w-[10px] h-[10px] fill-current" />
                                        Beli
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-[12px] hover:bg-gray-50 hover:text-gray-900 transition-colors text-center shadow-sm">
                            Lihat Semua Kelas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
