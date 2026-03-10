"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, RefreshCw, Calendar, Filter, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Array of beautiful pastel background colors for courses without thumbnails
    const pastelColors = [
        "bg-[#EEF2FF]", // Indigo tint
        "bg-[#F0FDF4]", // Green tint
        "bg-[#FEF2F2]", // Red tint
        "bg-[#F8FAFC]", // Slate tint
        "bg-[#FFF7ED]", // Orange tint
        "bg-[#FDF2F8]", // Pink tint
        "bg-[#F0F9FF]", // Sky tint
        "bg-[#FAF5FF]", // Purple tint
    ];

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

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100/50 flex flex-col min-h-[calc(100vh-120px)] mx-auto max-w-[1600px]">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-7 py-5 border-b border-gray-100 gap-4">
                <h1 className="text-[17px] font-extrabold text-[#1a1a1a]">All Courses</h1>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder="Search course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
                        />
                    </div>

                    {/* Tool Buttons */}
                    <div className="flex items-center gap-2">
                        <button onClick={fetchCourses} className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <RefreshCw className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <Calendar className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <Filter className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <MoreVertical className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Add New Button */}
                    <Link
                        href="/admin/courses/new"
                        className="bg-[#4F46E5] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-[13px] font-semibold inline-flex items-center gap-2 transition-colors ml-1 shadow-sm"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        Add New Course
                    </Link>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 p-7 bg-[#FCFCFD]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium pt-20">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Loading courses...
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium pt-20">
                        {searchQuery ? "No courses found matching your search." : "No courses found. Add a new course to get started!"}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course, index) => {
                            // Assign consistent pastel color based on index if no thumbnail
                            const colorClass = pastelColors[index % pastelColors.length];

                            return (
                                <div key={course.id} className="bg-white rounded-[16px] border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col hover:border-indigo-100 hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)] transition-all group">

                                    {/* Thumbnail Area */}
                                    <div className={`h-[160px] w-full p-4 flex items-center justify-center relative ${course.thumbnailUrl ? '' : colorClass}`}>
                                        {course.thumbnailUrl ? (
                                            <div className="w-full h-full relative overflow-hidden rounded-xl">
                                                {/* In case it's a real image URL */}
                                                <img
                                                    src={course.thumbnailUrl}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center px-4">
                                                <h3 className="font-extrabold text-[#1a1a1a]/80 text-[22px] tracking-tight leading-tight line-clamp-2">
                                                    {course.title}
                                                </h3>
                                            </div>
                                        )}

                                        {/* Status Badge Overlaid on image */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${course.status === "PUBLISHED"
                                                ? "bg-white/90 text-green-600 shadow-sm backdrop-blur-sm"
                                                : "bg-white/90 text-amber-600 shadow-sm backdrop-blur-sm"
                                                }`}>
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-[#1a1a1a] text-[15px] mb-2 line-clamp-1">{course.title}</h3>
                                            <p className="text-[13px] text-gray-400 font-medium leading-relaxed line-clamp-2 min-h-[40px]">
                                                {course.description || "No description provided for this course. Click edit to add more details about the curriculum."}
                                            </p>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {course.discountedPrice ? (
                                                    <>
                                                        <span className="text-[13px] font-bold text-[#1a1a1a]">Rp {course.discountedPrice.toLocaleString('id-ID')}</span>
                                                        <span className="text-[11px] font-medium text-gray-400 line-through">Rp {course.originalPrice?.toLocaleString('id-ID')}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[13px] font-bold text-[#1a1a1a]">Rp {course.originalPrice?.toLocaleString('id-ID') || 0}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2.5">
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 className="w-[14px] h-[14px]" strokeWidth={2.5} />
                                                </button>
                                                <Link
                                                    href={`/admin/courses/${course.id}`}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1a1a1a] transition-colors"
                                                    title="Edit Course"
                                                >
                                                    <Pencil className="w-[14px] h-[14px]" strokeWidth={2.5} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination Area */}
            {courses.length > 0 && (
                <div className="px-7 py-5 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-b-[20px]">
                    <p className="text-[13px] text-gray-500 font-medium">
                        Showing <span className="font-bold text-[#1a1a1a]">1-{filteredCourses.length}</span> from <span className="font-bold text-[#1a1a1a]">{courses.length}</span> data
                    </p>

                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
                            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                        </button>

                        <button className="w-8 h-8 flex items-center justify-center bg-[#4F46E5] text-white font-bold text-[13px] rounded-lg shadow-sm">
                            1
                        </button>

                        {courses.length > 10 && (
                            <button className="w-8 h-8 flex items-center justify-center text-gray-500 font-medium text-[13px] rounded-lg hover:bg-gray-50 transition-colors">
                                2
                            </button>
                        )}

                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
                            <ChevronRight className="w-5 h-5" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
