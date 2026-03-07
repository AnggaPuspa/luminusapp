"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Circle, PlayCircle, FileText, Menu, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { use } from "react";

export default function ClassroomPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    const [course, setCourse] = useState<any>(null);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [markingProgress, setMarkingProgress] = useState(false);

    useEffect(() => {
        const fetchClassroom = async () => {
            try {
                const res = await fetch(`/api/classroom/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);

                    // Auto select first lesson if none active
                    if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
                        setActiveLesson(data.modules[0].lessons[0]);
                    }
                } else if (res.status === 403) {
                    toast.error("Kamu belum terdaftar di kelas ini.");
                    router.push(`/kursus`);
                } else {
                    toast.error("Gagal memuat kelas.");
                }
            } catch (error) {
                console.error("Error fetching classroom", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchClassroom();
    }, [slug, router]);

    const getEmbedUrl = (url: string | null) => {
        if (!url) return null;

        try {
            // YouTube
            if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                let videoId = '';
                if (url.includes('youtube.com/watch')) {
                    videoId = new URL(url).searchParams.get('v') || '';
                } else {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                }
                return `https://www.youtube.com/embed/${videoId}`;
            }

            // Vimeo
            if (url.includes('vimeo.com/')) {
                const videoId = url.split('vimeo.com/')[1].split('/')[0];
                return `https://player.vimeo.com/video/${videoId}`;
            }

            return null; // Unsupported format, will display error or link
        } catch (e) {
            return null;
        }
    };

    const handleMarkCompleted = async () => {
        if (!activeLesson || markingProgress) return;
        setMarkingProgress(true);

        try {
            const res = await fetch("/api/classroom/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lessonId: activeLesson.id })
            });

            if (res.ok) {
                toast.success("Materi berhasil diselesaikan!");

                // Update local state so UI reflects the checkmark immediately
                const updatedCourse = { ...course };
                let foundMatch = false;

                for (let i = 0; i < updatedCourse.modules.length; i++) {
                    if (foundMatch) break;
                    for (let j = 0; j < updatedCourse.modules[i].lessons.length; j++) {
                        if (updatedCourse.modules[i].lessons[j].id === activeLesson.id) {
                            if (!updatedCourse.modules[i].lessons[j].progress) {
                                updatedCourse.modules[i].lessons[j].progress = [];
                            }
                            updatedCourse.modules[i].lessons[j].progress[0] = { completed: true };
                            foundMatch = true;
                            break;
                        }
                    }
                }

                setCourse(updatedCourse);
            } else {
                toast.error("Gagal menyimpan progress");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setMarkingProgress(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f1f2f6]">
            <div className="w-8 h-8 border-4 border-[#696EFF] border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (!course) return null;

    const isLessonCompleted = (lesson: any) => {
        return lesson.progress && lesson.progress.length > 0 && lesson.progress[0].completed;
    };

    const isActiveLessonCompleted = activeLesson ? isLessonCompleted(activeLesson) : false;
    const embedUrl = activeLesson ? getEmbedUrl(activeLesson.videoUrl) : null;

    return (
        <div className="flex h-screen bg-[#f1f2f6] overflow-hidden">
            {/* Sidebar Materi */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
                    <Link href="/dashboard/courses" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                        <ChevronLeft className="w-5 h-5" />
                        Kembali
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 border-b shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{course.title}</h2>
                    <p className="text-sm text-gray-500">Belajar dengan tekun dan konsisten!</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {course.modules?.map((module: any, idx: number) => (
                        <div key={module.id} className="bg-gray-50 rounded-lg p-2">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider px-3 py-2">
                                {idx + 1}. {module.title}
                            </h3>
                            <div className="space-y-1 mt-1">
                                {module.lessons?.map((lesson: any, lIdx: number) => {
                                    const active = activeLesson?.id === lesson.id;
                                    const completed = isLessonCompleted(lesson);

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${active ? "bg-[#696EFF]/10 text-[#696EFF]" : "hover:bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {completed ? (
                                                    <CheckCircle2 className={`w-5 h-5 ${active ? "text-[#696EFF]" : "text-green-500"}`} />
                                                ) : (
                                                    <Circle className={`w-5 h-5 ${active ? "text-[#696EFF]" : "text-gray-300"}`} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1 text-xs opacity-70">
                                                    {lesson.videoUrl ? <PlayCircle className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                                    <span>{lesson.duration > 0 ? `${lesson.duration} Menit` : 'Bacaan'}</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full overflow-hidden">
                {/* Mobile Header Toolbar */}
                <div className="md:hidden h-16 bg-white border-b flex items-center px-4 shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-gray-700 font-medium">
                        <Menu className="w-6 h-6" /> Daftar Materi
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-black p-0 md:p-8 flex items-start justify-center">
                    <div className="w-full max-w-5xl md:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl flex flex-col h-full md:h-auto pb-24 md:pb-0">
                        {/* Video Player Area */}
                        <div className="aspect-video w-full bg-black relative flex items-center justify-center shrink-0">
                            {activeLesson?.videoUrl ? (
                                embedUrl ? (
                                    <iframe
                                        src={embedUrl}
                                        className="w-full h-full absolute inset-0 border-0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                ) : (
                                    <div className="text-center p-6 bg-gray-800 rounded-xl m-4 w-full max-w-lg border border-gray-700">
                                        <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                        <p className="text-gray-300 mb-4">Video format tidak dapat di-embed secara otomatis.</p>
                                        <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2.5 bg-[#696EFF] text-white rounded-lg font-medium">
                                            Buka di Tab Baru
                                        </a>
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-gray-500 p-8 w-full max-w-lg bg-gray-800/50 rounded-xl m-4 border border-gray-700/50">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Materi ini tidak melampirkan video.</p>
                                    <p className="text-sm mt-2 opacity-70">Silakan baca instruksi di bawah.</p>
                                </div>
                            )}
                        </div>

                        {/* Lesson Content Area */}
                        <div className="bg-white flex-1 p-6 md:p-8 overflow-y-auto min-h-[400px]">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{activeLesson?.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <PlayCircle className="w-4 h-4" /> {activeLesson?.duration} Menit
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleMarkCompleted}
                                    disabled={isActiveLessonCompleted || markingProgress}
                                    className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm
                                        ${isActiveLessonCompleted
                                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                            : 'bg-[#696EFF] text-white hover:bg-blue-700'
                                        }`}
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {isActiveLessonCompleted ? "Selesai Dipelajari" : markingProgress ? "Menyimpan..." : "Tandai Selesai"}
                                </button>
                            </div>

                            <div className="prose prose-blue max-w-none text-gray-700">
                                {activeLesson?.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                ) : (
                                    <p className="text-gray-500 italic">Tidak ada teks panduan untuk materi ini.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
