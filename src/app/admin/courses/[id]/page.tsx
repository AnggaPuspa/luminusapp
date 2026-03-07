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
            [name]: name.includes("Price") || name === "duration" ? Number(value) : value
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/courses" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
                    <p className="text-gray-500 mt-1">Update details for {formData.title}</p>
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
                        <label className="text-sm font-medium text-gray-900">Thumbnail Image</label>
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
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload a new image file to replace the current thumbnail.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {saving ? "Updating..." : (
                            <>
                                <Save className="w-4 h-4" />
                                Update Course
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Curriculum Builder Section */}
            <div className="bg-white border rounded-xl shadow-sm p-6 md:p-8 mt-6">
                <ModuleBuilder
                    courseId={id}
                    initialModules={modules}
                    onRefresh={fetchCourse}
                />
            </div>
        </div>
    );
}
