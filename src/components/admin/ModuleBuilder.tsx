"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Video, FileText, HelpCircle } from "lucide-react";
import LessonFormModal from "./LessonFormModal";
import QuizEditorModal from "./QuizEditorModal";
import { toast } from "sonner";

interface Lesson {
    id: string;
    moduleId: string;
    title: string;
    duration: number;
    videoUrl: string | null;
    sortOrder: number;
    content: string | null;
}

interface ModuleData {
    id: string;
    courseId: string;
    title: string;
    sortOrder: number;
    lessons: Lesson[];
}

export default function ModuleBuilder({ courseId, initialModules, onRefresh }: { courseId: string, initialModules: ModuleData[], onRefresh: () => void }) {
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Lesson Modal State
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [editingLessonData, setEditingLessonData] = useState<any>(null);

    // Quiz Modal State
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/modules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newModuleTitle, courseId }),
            });

            if (res.ok) {
                setNewModuleTitle("");
                setIsAddingModule(false);
                toast.success("Modul berhasil ditambahkan");
                onRefresh();
            } else {
                toast.error("Gagal menambahkan modul");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus modul ini BESERTA semua materinya?")) return;

        try {
            const res = await fetch(`/api/admin/courses/${courseId}/modules?moduleId=${moduleId}`, { // Updated API endpoint
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Modul dihapus");
                onRefresh();
            } else {
                toast.error("Gagal menghapus modul");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan");
        }
    };

    const handleUpdateModuleTitle = async (moduleId: string, newTitle: string) => {
        try {
            await fetch(`/api/admin/modules/${moduleId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle })
            });
            setEditingModuleId(null);
            onRefresh();
        } catch (error) {
            console.error("Failed to update module", error);
        }
    };

    const openCreateLessonModal = (moduleId: string) => {
        setActiveModuleId(moduleId);
        setEditingLessonData(null);
        setIsLessonModalOpen(true);
    };

    const openEditLessonModal = (moduleId: string, lesson: Lesson) => {
        setActiveModuleId(moduleId);
        setEditingLessonData(lesson);
        setIsLessonModalOpen(true);
    };

    const handleSaveLesson = async (lessonData: any) => {
        if (editingLessonData) {
            // Update
            await fetch(`/api/admin/lessons/${editingLessonData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lessonData)
            });
        } else {
            // Create
            await fetch(`/api/admin/lessons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...lessonData, sortOrder: initialModules.find(m => m.id === activeModuleId)?.lessons.length || 0 })
            });
        }
        onRefresh();
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) return;
        try {
            await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
            onRefresh();
        } catch (error) {
            console.error("Failed to delete lesson", error);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Kurikulum Kursus</h2>

            {initialModules.length === 0 && (
                <div className="text-center py-8 bg-gray-50 border border-dashed rounded-lg text-gray-500">
                    Belum ada modul. Mulai bangun kursus Anda!
                </div>
            )}

            <div className="space-y-3">
                {initialModules.map((mod, idx) => (
                    <div key={mod.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        {/* Module Header */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleModule(mod.id)}>
                                {expandedModules[mod.id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                <span className="font-semibold text-gray-600 text-sm w-16">Modul {idx + 1}:</span>
                                {editingModuleId === mod.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        defaultValue={mod.title}
                                        className="border px-2 py-1 rounded w-1/2"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleUpdateModuleTitle(mod.id, e.currentTarget.value);
                                            if (e.key === "Escape") setEditingModuleId(null);
                                        }}
                                        onBlur={(e) => handleUpdateModuleTitle(mod.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="font-medium text-gray-900 flex-1">{mod.title}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setActiveQuizModuleId(mod.id); setIsQuizModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors" title="Kelola Kuis">
                                    <HelpCircle className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setEditingModuleId(mod.id); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Ubah Nama Modul">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors" title="Hapus Modul">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Lessons List (Expanded State) */}
                        {expandedModules[mod.id] && (
                            <div className="p-4 bg-white space-y-2 border-t border-gray-100">
                                {mod.lessons.map((lesson, lIdx) => (
                                    <div key={lesson.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg hover:border-blue-200 hover:shadow-sm transition-all bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                                                {idx + 1}.{lIdx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{lesson.title}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        {lesson.videoUrl ? <Video className="w-3 h-3 text-blue-500" /> : <FileText className="w-3 h-3 text-orange-500" />}
                                                        {lesson.videoUrl ? 'Video' : 'Teks'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{lesson.duration} menit</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 md:mt-0">
                                            <button onClick={() => openEditLessonModal(mod.id, lesson)} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 font-medium transition-colors">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteLesson(lesson.id)} className="text-xs bg-white text-red-600 border border-gray-200 px-3 py-1.5 rounded hover:bg-red-50 font-medium transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => openCreateLessonModal(mod.id)}
                                    className="w-full flex items-center justify-center gap-2 p-3 text-sm text-blue-600 hover:bg-blue-50 border border-dashed border-blue-200 rounded-lg transition-colors font-medium mt-2"
                                >
                                    <Plus className="w-4 h-4" /> Tambah Materi
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Module Input */}
            {!isAddingModule ? (
                <button
                    onClick={() => setIsAddingModule(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 text-gray-600 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" /> Tambah Modul Baru
                </button>
            ) : (
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-xl flex items-center gap-3">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Judul Modul (contoh: Persiapan Awal)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateModule()}
                    />
                    <button onClick={handleCreateModule} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Simpan</button>
                    <button onClick={() => setIsAddingModule(false)} className="text-gray-500 px-3 py-2 hover:bg-white rounded-lg">Batal</button>
                </div>
            )}

            {/* Modal */}
            <LessonFormModal
                isOpen={isLessonModalOpen}
                onClose={() => setIsLessonModalOpen(false)}
                moduleId={activeModuleId!}
                initialData={editingLessonData}
                onSubmit={handleSaveLesson}
            />

            {/* Quiz Modal */}
            <QuizEditorModal
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
                moduleId={activeQuizModuleId!}
                onSaved={onRefresh}
            />
        </div>
    );
}
