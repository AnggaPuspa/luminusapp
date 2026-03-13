"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import ModuleBuilder from "@/components/admin/ModuleBuilder";
import { toast } from "sonner";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [modules, setModules] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        thumbnailUrl: "",
        originalPrice: 0,
        discountedPrice: 0,
        duration: 0,
        status: "DRAFT",
    });

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/admin/courses/${id}`);
            if (!res.ok) throw new Error("Course not found");
            const data = await res.json();
            setModules(data.modules || []);
            setFormData({
                title: data.title,
                description: data.description || "",
                thumbnailUrl: data.thumbnailUrl || "",
                originalPrice: data.originalPrice,
                discountedPrice: data.discountedPrice || 0,
                duration: data.duration,
                status: data.status,
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
        setSaving(true);
        setError(null);
        setSuccess(null);

        const payload = {
            ...formData,
            discountedPrice: formData.discountedPrice === 0 ? null : formData.discountedPrice,
        };

        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update course");

            toast.success("Course updated successfully!");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || "Failed to update course");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading course details...</div>;
    }

    return (
        <div className="max-w-[900px] mx-auto space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/courses" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-xl hover:bg-gray-100 border border-transparent">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-[20px] font-bold text-[#1a1a1a]">Edit Course</h1>
                    <p className="text-[13px] text-[#8e95a5] mt-0.5">Update details for {formData.title}</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm border border-green-100">
                    {success}
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
                        <label className="text-[#8e95a5] text-[12px] font-semibold uppercase tracking-wider block">Thumbnail Image</label>
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

                                        setSaving(true);
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

                                            // Auto-save the course with new thumbnail URL
                                            const saveRes = await fetch(`/api/admin/courses/${id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ ...formData, thumbnailUrl: url }),
                                            });
                                            if (!saveRes.ok) throw new Error("Failed to save image to course");

                                            toast.success("Image uploaded and saved to course!");
                                        } catch (err: any) {
                                            setError(err.message || "Failed to upload image");
                                            toast.error(err.message || "Failed to upload image");
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]/30 transition-all text-gray-600 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#4F46E5]/10 file:text-[#4F46E5] hover:file:bg-[#4F46E5]/20"
                                />
                                <p className="text-[11.5px] text-[#8e95a5] mt-2 font-medium">Upload a new image file to replace the current thumbnail.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 transition-colors disabled:opacity-70 text-[13px] shadow-sm shadow-[#4F46E5]/20"
                    >
                        {saving ? "Memperbarui..." : (
                            <>
                                <Save className="w-4 h-4" strokeWidth={2.5} />
                                Update Kursus
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Curriculum Builder Section */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200/80 p-6 md:p-8 mt-6">
                <ModuleBuilder
                    courseId={id}
                    initialModules={modules}
                    onRefresh={fetchCourse}
                />
            </div>
        </div>
    );
}
