"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { invalidateDashboard } from "@/hooks/use-dashboard";

// ─── Types ───────────────────────────────────────────────────────

export interface Lesson {
    id: string;
    title: string;
    duration: number;
    videoUrl?: string | null;
    content?: string | null;
    moduleId: string;
    progress?: { completed: boolean }[];
    resources?: any;
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    quiz?: { title: string } | null;
}

export interface Course {
    id: string;
    title: string;
    modules: Module[];
    accessType?: string;
    isSubscriber?: boolean;
}

// ─── Helpers (pure functions) ────────────────────────────────────

export function getEmbedUrl(url: string | null): string | null {
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
    } catch {
        return null;
    }
}

export function isLessonCompleted(lesson: Lesson): boolean {
    return !!(lesson.progress && lesson.progress.length > 0 && lesson.progress[0].completed);
}

export function isLessonLocked(lesson: Lesson, allLessonsFlat: Lesson[]): boolean {
    const idx = allLessonsFlat.findIndex((l) => l.id === lesson.id);
    if (idx <= 0) return false;
    return !isLessonCompleted(allLessonsFlat[idx - 1]);
}

// ─── Main Hook ───────────────────────────────────────────────────

export function useClassroom(slug: string) {
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [markingProgress, setMarkingProgress] = useState(false);

    useEffect(() => {
        const fetchClassroom = async () => {
            try {
                const res = await fetch(`/api/classroom/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
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

    const handleMarkCompleted = useCallback(async () => {
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
                invalidateDashboard();

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

                const flat = updatedCourse.modules.flatMap((m: Module) => m.lessons);
                const currentIdx = flat.findIndex((l: Lesson) => l.id === activeLesson.id);
                if (currentIdx >= 0 && currentIdx < flat.length - 1) {
                    setActiveLesson(flat[currentIdx + 1]);
                }
            } else {
                toast.error("Gagal menyimpan progress");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setMarkingProgress(false);
        }
    }, [activeLesson, markingProgress, course]);

    return {
        course,
        activeLesson,
        setActiveLesson,
        loading,
        markingProgress,
        handleMarkCompleted,
    };
}
