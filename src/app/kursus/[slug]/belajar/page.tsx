"use client";

import { useState } from "react";
import { ChevronLeft, FileText, HelpCircle, Award, Heart, Lock, Check, Play } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import CertificateDownloader from "@/components/common/CertificateDownloader";
import AddReviewModal from "@/components/AddReviewModal";
import QuizModal from "@/components/classroom/QuizModal";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useClassroom, getEmbedUrl, isLessonCompleted, isLessonLocked, type Module, type Lesson } from "@/hooks/use-classroom";

export default function ClassroomPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const {
        course,
        activeLesson,
        setActiveLesson,
        loading,
        markingProgress,
        handleMarkCompleted,
    } = useClassroom(slug);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'videos' | 'resources' | 'support'>('videos');
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [activeQuizModule, setActiveQuizModule] = useState<{ id: string, moduleId: string, title?: string } | null>(null);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F1F2F6]">
            <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (!course) return null;

    const allLessonsFlat: Lesson[] = course.modules?.flatMap((m: Module) => m.lessons) || [];

    const totalLessons = course.modules?.reduce((acc: number, mod: Module) => acc + (mod.lessons?.length || 0), 0) || 0;
    const completedLessonsCount = course.modules?.reduce((acc: number, mod: Module) => {
        return acc + (mod.lessons?.filter(isLessonCompleted).length || 0);
    }, 0) || 0;
    const isCourseFullyCompleted = totalLessons > 0 && completedLessonsCount === totalLessons;

    const isActiveLessonCompleted = activeLesson ? isLessonCompleted(activeLesson) : false;
    const embedUrl = activeLesson ? getEmbedUrl(activeLesson.videoUrl || null) : null;

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
                                    <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-[24px] m-4 w-full max-w-lg border border-white/10 shadow-2xl">
                                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/5">
                                            <FileText className="w-7 h-7 text-[#96A9C8]" />
                                        </div>
                                        <h3 className="text-[19px] font-bold text-white mb-2">Video Tidak Mendukung Auto-Play</h3>
                                        <p className="text-gray-400 mb-8 text-[14px]">Sistem mendeteksi format video ini tidak dapat diputar langsung di dalam halaman. Silakan tonton melalui tab eksternal.</p>
                                        <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white hover:bg-gray-100 text-[#032038] rounded-full font-bold transition-all shadow-lg active:scale-95">
                                            <Play className="w-[14px] h-[14px] fill-current" />
                                            Buka di Tab Baru
                                        </a>
                                    </div>
                                )
                            ) : (
                                <div className="text-center p-8 w-full max-w-lg">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner block mx-auto">
                                        <FileText className="w-8 h-8 text-[#96A9C8]/50" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Materi Teks & Bacaan</h3>
                                    <p className="text-[#96A9C8] text-[15px]">Tidak ada lampiran video untuk materi ini.<br />Silakan gulir ke bawah untuk mulai membaca modul pembelajaran.</p>
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
                                    className={`shrink-0 px-8 py-2.5 rounded-full font-bold text-[15px] transition-all bg-[#032038] text-white
                                        ${(isActiveLessonCompleted || markingProgress)
                                            ? 'opacity-60 cursor-not-allowed'
                                            : 'hover:opacity-90 shadow-md'
                                        }`}
                                >
                                    Selesai
                                </button>

                                {completedLessonsCount / (totalLessons || 1) >= 0.5 && (
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        <Heart className="w-4 h-4 fill-current" /> Ulasan
                                    </button>
                                )}

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
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                        {activeLesson.content}
                                    </ReactMarkdown>
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
                                            const locked = isLessonLocked(lesson, allLessonsFlat);

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => !locked && setActiveLesson(lesson)}
                                                    disabled={locked}
                                                    title={locked ? 'Selesaikan materi sebelumnya terlebih dahulu' : ''}
                                                    className={`w-full flex items-center gap-2.5 px-3 py-2 border text-left transition-all mb-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                                                        ${locked
                                                            ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-100'
                                                            : active
                                                                ? 'bg-[#032038] text-white border-transparent shadow-md'
                                                                : 'bg-white hover:border-gray-300 border-gray-100 group'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                                                        ${locked
                                                            ? 'bg-gray-200 text-gray-400'
                                                            : active
                                                                ? 'bg-white text-[#032038]'
                                                                : 'bg-[#032038] text-white'
                                                        }`}>
                                                        {locked
                                                            ? <Lock className="w-3.5 h-3.5" />
                                                            : <Play className="w-3 h-3 fill-current ml-[2px]" />
                                                        }
                                                    </div>

                                                    <div className="flex-1 min-w-0 pr-1">
                                                        <p className={`text-[13px] font-bold truncate ${active ? 'text-white' : 'text-[#032038]'}`}>
                                                            {lesson.title}
                                                        </p>
                                                        <p className={`text-[11px] font-medium tracking-wide ${active ? 'text-[#96A9C8]' : 'text-[#032038]/60'}`}>
                                                            {(() => {
                                                                if (!lesson.duration || lesson.duration <= 0) return '0:00';
                                                                const m = Math.floor(lesson.duration / 60);
                                                                const s = lesson.duration % 60;
                                                                return `${m}:${s.toString().padStart(2, '0')}`;
                                                            })()}
                                                        </p>
                                                    </div>

                                                    {completed && (
                                                        <div className="w-[18px] h-[18px] rounded-full bg-[#20D08A] text-white flex items-center justify-center flex-shrink-0">
                                                            <Check className="w-[10px] h-[10px] stroke-[3]" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}

                                        {module.quiz && (
                                            <button
                                                onClick={() => openQuiz(module.id, module.quiz?.title)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all mb-2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] border bg-white border-gray-100 hover:border-gray-300 group mt-1"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-[#032038] text-white flex items-center justify-center flex-shrink-0">
                                                    <HelpCircle className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-1">
                                                    <p className="text-[13px] font-bold truncate text-[#032038]">Kuis Modul</p>
                                                    <p className="text-[11px] font-medium tracking-wide text-[#032038]/60">{module.quiz.title || 'Uji Pemahaman'}</p>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="py-6">
                                {(() => {
                                    let parsedResources: any[] = [];
                                    try {
                                        if (activeLesson?.resources) {
                                            parsedResources = typeof activeLesson.resources === 'string'
                                                ? JSON.parse(activeLesson.resources)
                                                : activeLesson.resources;
                                        }
                                    } catch (e) { console.error(e); }

                                    const isSubscriber = course.isSubscriber === true;

                                    if (parsedResources.length === 0) {
                                        return (
                                            <div className="text-center py-10">
                                                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm text-gray-400 font-medium">Belum ada resource tambahan untuk materi ini.</p>
                                            </div>
                                        );
                                    }

                                    if (!isSubscriber) {
                                        return (
                                            <div className="text-center py-10 bg-gray-50 border border-gray-100 rounded-2xl mx-2 shadow-inner">
                                                <Award className="w-12 h-12 text-[#A855F7] mx-auto mb-4 opacity-70" />
                                                <h3 className="text-gray-900 font-bold mb-2">Premium Resources</h3>
                                                <p className="text-sm text-gray-500 max-w-[250px] mx-auto mb-5 leading-relaxed">
                                                    Materi ini melampirkan file premium (source code, template, dll). Upgrade ke Subscription untuk mengunduh.
                                                </p>
                                                <Link href="/pricing" className="inline-block bg-[#A855F7] text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                                                    Upgrade Sekarang
                                                </Link>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="px-2 space-y-3">
                                            <div className="mb-4">
                                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
                                                    Premium Akses
                                                </span>
                                                <h3 className="font-bold text-gray-900">Download Resources</h3>
                                            </div>
                                            {parsedResources.map((res: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-purple-700 transition-colors">
                                                            {res.title || "Download File"}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate mt-0.5">{res.url}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    );
                                })()}
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

            <QuizModal
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
                moduleId={activeQuizModule?.moduleId || ""}
                courseSlug={slug}
                onQuizComplete={() => { }}
            />
        </div>
    );
}
