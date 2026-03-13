"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        thumbnailUrl: "",
        originalPrice: 0,
        discountedPrice: 0,
        duration: 0,
        status: "DRAFT",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "duration" ? Number(value) : value
        }));
    };

    const formatCurrency = (val: number) => {
        if (!val) return "";
        return new Intl.NumberFormat('id-ID').format(val);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericStr = value.replace(/\D/g, "");
        setFormData(prev => ({
            ...prev,
            [name]: numericStr ? parseInt(numericStr, 10) : 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Prepare data (set discountedPrice to null if 0 to match DB schema)
        const payload = {
            ...formData,
            discountedPrice: formData.discountedPrice === 0 ? null : formData.discountedPrice,
        };

        try {
            const res = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create course");
            }

            const newCourse = await res.json();
            toast.success("Course created successfully!");
            router.push(`/admin/courses/${newCourse.id}`);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || "Failed to create course");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[900px] mx-auto space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/courses" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-xl hover:bg-gray-100 border border-transparent">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-[20px] font-bold text-[#1a1a1a]">Create New Course</h1>
                    <p className="text-[13px] text-[#8e95a5] mt-0.5">Fill in the details to add a new course.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-[20px] border border-gray-200/80 shadow-sm p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Course Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-[#1a1a1a]"
                            placeholder="e.g. Full-Stack JavaScript Mastery"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-[#1a1a1a] resize-y"
                            placeholder="Brief description of what students will learn..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Original Price <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium text-[13px]">Rp</span>
                            </div>
                            <input
                                type="text"
                                name="originalPrice"
                                required
                                value={formatCurrency(formData.originalPrice)}
                                onChange={handleCurrencyChange}
                                className="w-full pl-[42px] pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-[#1a1a1a]"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Discounted Price</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium text-[13px]">Rp</span>
                            </div>
                            <input
                                type="text"
                                name="discountedPrice"
                                value={formatCurrency(formData.discountedPrice)}
                                onChange={handleCurrencyChange}
                                className="w-full pl-[42px] pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-[#1a1a1a]"
                                placeholder="Kosongkan jika tidak ada diskon"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Total Duration (Hours)</label>
                        <input
                            type="number"
                            name="duration"
                            min="0"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-[#1a1a1a]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-[#1a1a1a]"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Thumbnail Image <span className="text-red-500">*</span></label>
                        <div className="flex gap-4 items-center">
                            {formData.thumbnailUrl && (
                                <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="w-24 h-16 object-cover rounded-xl border border-gray-100" />
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setLoading(true);
                                        setError(null);
                                        const uploadData = new FormData();
                                        uploadData.append('file', file);

                                        try {
                                            const res = await fetch('/api/admin/upload', {
                                                method: 'POST',
                                                body: uploadData,
                                            });
                                            if (!res.ok) {
                                                const errData = await res.json().catch(() => ({}));
                                                throw new Error(errData.message || "Upload failed");
                                            }
                                            const { url } = await res.json();
                                            setFormData(prev => ({ ...prev, thumbnailUrl: url }));
                                        } catch (err: any) {
                                            setError(err.message || "Failed to upload image");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-gray-600 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#4F46E5]/10 file:text-[#4F46E5] hover:file:bg-[#4F46E5]/20"
                                />
                                <p className="text-[11.5px] text-[#8e95a5] mt-2 font-medium">Upload an image file (JPG, PNG). It will be saved securely to Supabase Storage.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[13px] mr-3"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 transition-colors disabled:opacity-70 text-[13px] shadow-sm shadow-[#4F46E5]/20"
                    >
                        {loading ? "Menyimpan..." : (
                            <>
                                <Save className="w-4 h-4" strokeWidth={2.5} />
                                Simpan Kursus
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
