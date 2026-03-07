"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Bell } from "lucide-react";
import { toast } from "sonner";
import StudentTopbar from "@/components/dashboard/StudentTopbar";

export default function StudentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "", // Only sent if user types a new one
    });

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
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            <div className="flex-1 space-y-8">
                <StudentTopbar />
                <div className="max-w-2xl space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h1>
                        <p className="text-gray-500 mt-1">Kelola data personal dan keamanan akunmu.</p>
                    </div>

                    <div className="bg-white border rounded-xl shadow-sm p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="pl-10 w-full block rounded-lg border-gray-300 border px-3 py-2.5 outline-none focus:ring-1 focus:ring-[#696EFF] focus:border-[#696EFF] transition-colors"
                                        placeholder="Nama Lengkap"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="pl-10 w-full block rounded-lg border-gray-300 border px-3 py-2.5 outline-none focus:ring-1 focus:ring-[#696EFF] focus:border-[#696EFF] transition-colors"
                                        placeholder="Email address"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ubah Password Baru (Opsional)</label>
                                <p className="text-xs text-gray-500 mb-3">Kosongkan jika kamu tidak ingin mengganti password.</p>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 w-full block rounded-lg border-gray-300 border px-3 py-2.5 outline-none focus:ring-1 focus:ring-[#696EFF] focus:border-[#696EFF] transition-colors"
                                        placeholder="Min. 8 karakter"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`flex items-center gap-2 px-6 py-2.5 bg-[#696EFF] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Profile Column Dummy Spacer for Layout Consistency */}
            <div className="w-full xl:w-[340px] flex-shrink-0 space-y-6 flex flex-col hidden xl:flex">
                {/* Top Header Match Menu Height */}
                <div className="flex items-center justify-end gap-5 h-12 mb-2 px-2">
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
                        <span className="font-semibold text-gray-800 text-sm">{formData.name ? formData.name.split(' ')[0] : 'Pelajar'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
