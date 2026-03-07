"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Award, CheckCircle2 } from "lucide-react";

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/student/courses");
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Kelas Saya</h1>
                <p className="text-gray-500 mt-1">Lanjutkan belajar dan capai targetmu.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl border p-4 h-64 animate-pulse">
                            <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center shadow-sm">
                    <PlayCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Kamu belum memiliki kelas</h3>
                    <p className="text-gray-500 mb-6">Yuk mulai investasi pada dirimu sendiri dengan membeli kelas.</p>
                    <Link href="/kursus" className="inline-block px-6 py-3 bg-[#696EFF] text-white rounded-lg font-medium hover:bg-blue-700 transition">
                        Cari Kelas
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col group">
                            <div className="h-48 relative bg-gray-100 overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <Image
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <PlayCircle className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                    {course.title}
                                </h3>

                                <div className="mt-auto pt-4">
                                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                                        <span className="flex items-center gap-1">
                                            {course.progressPercent === 100 ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Award className="w-4 h-4" />
                                            )}
                                            {course.completedLessons} / {course.totalLessons} materi
                                        </span>
                                        <span className="font-medium text-gray-700">{course.progressPercent}%</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                                        <div
                                            className={`h-2 rounded-full ${course.progressPercent === 100 ? 'bg-green-500' : 'bg-[#696EFF]'}`}
                                            style={{ width: `${course.progressPercent}%` }}
                                        ></div>
                                    </div>

                                    <Link
                                        href={`/kursus/${course.slug}/belajar`}
                                        className="block w-full text-center px-4 py-2.5 bg-blue-50 text-[#696EFF] font-semibold rounded-lg hover:bg-blue-100 transition"
                                    >
                                        Lanjut Belajar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
