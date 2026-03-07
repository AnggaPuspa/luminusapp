"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/admin/courses");
            const data = await res.json();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setCourses(courses.filter((course) => course.id !== id));
                toast.success("Course deleted successfully");
            } else {
                toast.error("Failed to delete course");
            }
        } catch (error) {
            console.error("Failed to delete course", error);
            toast.error("An error occurred while deleting the course");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                    <p className="text-gray-500 mt-1">Manage all your online courses here.</p>
                </div>
                <Link
                    href="/admin/courses/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Course
                </Link>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Course Title</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Price</th>
                                <th className="px-6 py-4 font-semibold">Modules</th>
                                <th className="px-6 py-4 font-semibold">Enrollments</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading courses...
                                    </td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No courses found. Click "Create Course" to add one.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {course.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${course.status === "PUBLISHED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-amber-100 text-amber-700"
                                                }`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course.discountedPrice ? (
                                                <div>
                                                    <span className="text-gray-900 font-medium whitespace-nowrap">Rp {course.discountedPrice.toLocaleString("id-ID")}</span>
                                                    <span className="text-xs text-gray-400 line-through block whitespace-nowrap">Rp {course.originalPrice.toLocaleString("id-ID")}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-900 font-medium whitespace-nowrap">Rp {course.originalPrice.toLocaleString("id-ID")}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {course._count?.modules || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            {course._count?.enrollments || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/admin/courses/${course.id}`} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Course">
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(course.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Course">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
