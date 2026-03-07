"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Circle, PlayCircle, FileText, HelpCircle, Award, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { use } from "react";
import CertificateDownloader from "@/components/common/CertificateDownloader";
import AddReviewModal from "@/components/AddReviewModal";
import QuizModal from "@/components/classroom/QuizModal";

interface Lesson {
    id: string;
    title: string;
    duration: number;
    videoUrl?: string | null;
    content?: string | null;
    moduleId: string;
    progress?: { completed: boolean }[];
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    quiz?: { title: string } | null;
}

interface Course {
    id: string;
    title: string;
    modules: Module[];
}

export default function ClassroomPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [markingProgress, setMarkingProgress] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'videos' | 'resources' | 'support'>('videos');

    // Quiz State
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [activeQuizModule, setActiveQuizModule] = useState<{ id: string, moduleId: string, title?: string } | null>(null);

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
            if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                let videoId = '';
                if (url.includes('youtube.com/watch')) {
                    videoId = new URL(url).searchParams.get('v') || '';
                } else {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                }
                return `https://www.youtube.com/embed/${videoId}`;
            }

            if (url.includes('vimeo.com/')) {
                const videoId = url.split('vimeo.com/')[1].split('/')[0];
                return `https://player.vimeo.com/video/${videoId}`;
            }

            return null;
        } catch (e) {
            return null;
        }
    };

    const handleMarkCompleted = async () => {
        if (!activeLesson || markingProgress || !course) return;
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
                            updatedCourse.modules[i].lessons[j].progress![0] = { completed: true };
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
        return <div className="min-h-screen flex items-center justify-center bg-[#F1F2F6]">
            <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (!course) return null;

    const isLessonCompleted = (lesson: Lesson) => {
        return lesson.progress && lesson.progress.length > 0 && lesson.progress[0].completed;
    };

    // Calculate total course completion
    const totalLessons = course.modules?.reduce((acc: number, mod: Module) => acc + (mod.lessons?.length || 0), 0) || 0;
    const completedLessonsCount = course.modules?.reduce((acc: number, mod: Module) => {
        return acc + (mod.lessons?.filter(isLessonCompleted).length || 0);
    }, 0) || 0;
    const isCourseFullyCompleted = totalLessons > 0 && completedLessonsCount === totalLessons;

    const isActiveLessonCompleted = activeLesson ? isLessonCompleted(activeLesson) : false;
    const embedUrl = activeLesson ? getEmbedUrl(activeLesson.videoUrl || null) : null;

    // Find if the active lesson is the last lesson of a module with a quiz
    const activeModule = activeLesson ? course.modules?.find((m: Module) => m.id === activeLesson.moduleId) : null;
    const isLastLesson = activeModule && activeLesson ? activeModule.lessons[activeModule.lessons.length - 1].id === activeLesson.id : false;

    const openQuiz = (moduleId: string, title?: string) => {
        setActiveQuizModule({ id: moduleId, moduleId, title });
        setIsQuizModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#F1F2F6] p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto bg-white rounded-3xl p-6 lg:p-8 shadow-sm">

                {/* Modern Breadcrumb inside the card */}
                <div className="flex items-center gap-3 text-sm font-bold mb-8">
                    <Link href="/dashboard/courses" className="flex items-center gap-2 text-gray-900 hover:text-purple-600 transition-colors">
                        <div className="w-6 h-6 rounded border border-purple-200 flex items-center justify-center text-purple-600">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        Courses
                    </Link>
                    <span className="text-gray-400 font-normal">-</span>
                    <span className="text-gray-500 font-medium truncate">{course.title}</span>
                </div>

                {/* Main Content Split */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Video + Course Info */}
                    <div className="flex-1 min-w-0">
                        {/* Video Player */}
                        <div className="bg-black rounded-2xl overflow-hidden mb-6 aspect-video relative flex items-center justify-center shadow-sm">
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
                                        <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2.5 bg-[#A855F7] text-white rounded-lg font-medium">
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

                        {/* Badges & Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex gap-2">
                                <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-lg font-semibold">Advance</span>
                                <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-lg font-semibold">Live Class</span>
                                <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-lg font-semibold">24 Class</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleMarkCompleted}
                                    disabled={isActiveLessonCompleted || markingProgress}
                                    className={`shrink-0 flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all
                                        ${isActiveLessonCompleted
                                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                            : 'bg-[#A855F7] text-white hover:bg-[#9333EA] shadow-sm'
                                        }`}
                                >
                                    {isActiveLessonCompleted ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 fill-white text-[#A855F7]" />}
                                    {isActiveLessonCompleted ? "Selesai" : markingProgress ? "Menyimpan..." : "Tandai Selesai"}
                                </button>

                                {completedLessonsCount / (totalLessons || 1) >= 0.5 && (
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        <Heart className="w-4 h-4 fill-current" /> Ulasan
                                    </button>
                                )}

                                {/* Certificate Button if complete */}
                                {isCourseFullyCompleted && (
                                    <CertificateDownloader
                                        courseId={course.id}
                                        userId={""}
                                        variant="icon"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{activeLesson?.title || course.title}</h1>

                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium">
                                {activeLesson?.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                ) : (
                                    <p className="text-gray-400 italic">Tidak ada teks panduan untuk materi ini.</p>
                                )}
                            </div>
                        </div>

                        {/* Quiz Call to Action */}
                        {isLastLesson && activeModule?.quiz && isActiveLessonCompleted && (
                            <div className="mt-8 bg-[#FDF4FF] border border-[#F5D0FE] rounded-2xl p-6 text-center shadow-sm">
                                <Award className="w-12 h-12 text-[#A855F7] mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Kamu telah menyelesaikan Modul ini!</h3>
                                <p className="text-gray-600 mb-5 text-sm max-w-lg mx-auto">
                                    Saatnya menguji pemahaman kamu. Kerjakan Kuis singkat ini untuk memperkuat memori.
                                </p>
                                <button
                                    onClick={() => openQuiz(activeModule.id, activeModule.quiz?.title)}
                                    className="bg-[#A855F7] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-[#9333EA] transition-all text-sm"
                                >
                                    Mulai Kuis Modul
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Lesson List */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab('videos')}
                                className={`flex-1 py-1.5 px-3 border rounded-lg text-sm font-semibold transition-all ${activeTab === 'videos' ? 'border-[#D8B4FE] text-[#9333EA] bg-white' : 'border-gray-100 text-gray-500 bg-gray-50 hover:bg-white hover:text-gray-900'}`}
                            >
                                All Videos
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`flex-1 py-1.5 px-3 border rounded-lg text-sm font-semibold transition-all ${activeTab === 'resources' ? 'border-[#D8B4FE] text-[#9333EA] bg-white' : 'border-gray-100 text-gray-500 bg-gray-50 hover:bg-white hover:text-gray-900'}`}
                            >
                                Resources
                            </button>
                            <button
                                onClick={() => setActiveTab('support')}
                                className={`flex-1 py-1.5 px-3 border rounded-lg text-sm font-semibold transition-all ${activeTab === 'support' ? 'border-[#D8B4FE] text-[#9333EA] bg-white' : 'border-gray-100 text-gray-500 bg-gray-50 hover:bg-white hover:text-gray-900'}`}
                            >
                                Support
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'videos' && (
                            <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                                {course.modules?.map((module: Module, mIdx: number) => (
                                    <div key={module.id} className="mb-4">
                                        <div className="mb-2 px-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Modul {mIdx + 1}</p>
                                            <p className="text-sm font-bold text-gray-800 mt-0.5 mb-2 border-b border-gray-100 pb-2">{module.title}</p>
                                        </div>

                                        {module.lessons?.map((lesson: Lesson) => {
                                            const active = activeLesson?.id === lesson.id;
                                            const completed = isLessonCompleted(lesson);

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson(lesson)}
                                                    className="w-full flex gap-4 px-2 py-3 text-left transition-all border-b border-gray-50 last:border-0 hover:bg-gray-50 group rounded-xl"
                                                >
                                                    {/* Icon */}
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${active
                                                        ? 'bg-[#A855F7] text-white shadow-md shadow-purple-200'
                                                        : 'bg-white text-gray-400 border border-gray-200 group-hover:border-purple-200'
                                                        }`}>
                                                        <PlayCircle className={`w-5 h-5 ${active ? 'fill-white text-[#A855F7]' : ''}`} />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <p className={`text-sm leading-snug ${active ? 'font-bold text-gray-900' : 'font-semibold text-gray-700 group-hover:text-gray-900'}`}>
                                                            {lesson.title}
                                                        </p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {lesson.duration > 0 ? `0:${lesson.duration.toString().padStart(2, '0')}` : '0:00'}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {module.quiz && (
                                            <button
                                                onClick={() => openQuiz(module.id, module.quiz?.title)}
                                                className="w-full flex items-center gap-4 px-2 py-3 text-left transition-all border-b border-gray-50 hover:bg-gray-50 group rounded-xl mt-1"
                                            >
                                                <div className="w-11 h-11 rounded-xl bg-white text-gray-400 border border-gray-200 group-hover:border-purple-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                                    <HelpCircle className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Kuis Modul</p>
                                                    <p className="text-sm text-gray-400 mt-1">{module.quiz.title || 'Uji Pemahaman'}</p>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="py-10 text-center">
                                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-400 font-medium">Belum ada resource tambahan untuk kelas ini.</p>
                            </div>
                        )}

                        {activeTab === 'support' && (
                            <div className="py-10 text-center">
                                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-400 font-medium">Butuh bantuan? Hubungi tim support kami.</p>
                                <a href="mailto:support@luminus.com" className="inline-block mt-3 text-sm text-[#A855F7] font-semibold hover:underline">
                                    support@luminus.com
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {course && (
                <AddReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    courseId={course.id}
                    courseTitle={course.title}
                />
            )}

            {/* Student Quiz Modal */}
            <QuizModal
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
                moduleId={activeQuizModule?.moduleId || ""}
                courseSlug={slug}
                onQuizComplete={() => {
                    // Optional: trigger confetti or just refresh course data so score is synced
                }}
            />
        </div>
    );
}
