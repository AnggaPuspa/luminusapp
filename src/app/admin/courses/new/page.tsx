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
            [name]: name.includes("Price") || name === "duration" ? Number(value) : value
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/courses" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                    <p className="text-gray-500 mt-1">Fill in the details to add a new course.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-900">Course Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                            placeholder="e.g. Full-Stack JavaScript Mastery"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-900">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none resize-y"
                            placeholder="Brief description of what students will learn..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Original Price (Rp) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="originalPrice"
                            required
                            min="0"
                            value={formData.originalPrice}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Discounted Price (Rp)</label>
                        <input
                            type="number"
                            name="discountedPrice"
                            min="0"
                            value={formData.discountedPrice}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                            placeholder="Leave 0 for no discount"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Total Duration (Hours)</label>
                        <input
                            type="number"
                            name="duration"
                            min="0"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-900">Thumbnail Image <span className="text-red-500">*</span></label>
                        <div className="flex gap-4 items-center">
                            {formData.thumbnailUrl && (
                                <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="w-24 h-16 object-cover rounded-lg border" />
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
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload an image file (JPG, PNG). It will be saved securely to Supabase Storage.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {loading ? "Saving..." : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Course
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
