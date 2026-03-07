"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
    id: string;
    questionText: string;
    options: string[];
    correctIndex: number;
    sortOrder: number;
}

interface Quiz {
    id: string;
    title: string;
    questions: Question[];
}

export default function QuizEditorModal({
    isOpen,
    onClose,
    moduleId,
    onSaved
}: {
    isOpen: boolean;
    onClose: () => void;
    moduleId: string;
    onSaved: () => void;
}) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // New Question state
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [qText, setQText] = useState("");
    const [qOptions, setQOptions] = useState<string[]>(["", "", "", ""]);
    const [qCorrectIndex, setQCorrectIndex] = useState(0);

    const resetForm = () => {
        setIsEditingQuestion(false);
        setActiveQuestionId(null);
        setQText("");
        setQOptions(["", "", "", ""]);
        setQCorrectIndex(0);
    };

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/quizzes/module/${moduleId}`);
            if (res.ok) {
                const data = await res.json();
                setQuiz(data);
            } else if (res.status === 404) {
                // If not found, that's fine, we will create it when they add a title
                setQuiz({ id: "NEW", title: "Review Quiz", questions: [] });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && moduleId) {
            resetForm();
            fetchQuiz();
        }
    }, [isOpen, moduleId]);

    const handleSaveQuizTitle = async (title: string) => {
        if (!title.trim() || !quiz) return;
        setIsSaving(true);
        try {
            if (quiz.id === "NEW") {
                const res = await fetch(`/api/admin/quizzes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ moduleId, title })
                });
                if (res.ok) {
                    const data = await res.json();
                    setQuiz(data);
                    toast.success("Quiz created");
                } else {
                    toast.error("Failed to create quiz");
                }
            } else {
                // Future: Update quiz title API if needed
                setQuiz({ ...quiz, title });
            }
        } catch (error) {
            toast.error("Error creating quiz");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteQuiz = async () => {
        if (!quiz || quiz.id === "NEW") return;
        if (!confirm("Delete this entire quiz?")) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/quizzes/${quiz.id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Quiz deleted");
                onClose();
                onSaved();
            } else {
                toast.error("Failed to delete quiz");
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Replace the options text
    const updateOption = (index: number, val: string) => {
        const newer = [...qOptions];
        newer[index] = val;
        setQOptions(newer);
    };

    const addOption = () => {
        setQOptions([...qOptions, ""]);
    };

    const removeOption = (index: number) => {
        if (qOptions.length <= 2) {
            return toast.error("Minimum 2 options required");
        }
        const newer = qOptions.filter((_, i) => i !== index);
        setQOptions(newer);
        if (qCorrectIndex >= newer.length) {
            setQCorrectIndex(newer.length - 1);
        } else if (qCorrectIndex === index) {
            setQCorrectIndex(0);
        } else if (qCorrectIndex > index) {
            setQCorrectIndex(qCorrectIndex - 1);
        }
    };

    const handleSaveQuestion = async () => {
        if (!quiz) return;

        // Ensure quiz is created in DB first
        let currentQuizId = quiz.id;
        if (quiz.id === "NEW") {
            try {
                const res = await fetch(`/api/admin/quizzes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ moduleId, title: quiz.title || "Module Quiz" })
                });
                if (res.ok) {
                    const data = await res.json();
                    setQuiz(data);
                    currentQuizId = data.id;
                } else {
                    return toast.error("Failed to create parent quiz");
                }
            } catch (error) {
                return toast.error("Error creating parent quiz");
            }
        }

        if (!qText.trim()) return toast.error("Question text is required");
        if (qOptions.some(o => !o.trim())) return toast.error("All options must have text");

        setIsSaving(true);
        try {
            const payload = {
                quizId: currentQuizId,
                questionText: qText,
                options: qOptions,
                correctIndex: qCorrectIndex,
                sortOrder: quiz.questions?.length || 0
            };

            const url = activeQuestionId
                ? `/api/admin/questions/${activeQuestionId}`
                : `/api/admin/questions`;
            const method = activeQuestionId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(activeQuestionId ? "Question updated" : "Question added");
                resetForm();
                fetchQuiz(); // Refresh the list
            } else {
                toast.error("Failed to save question");
            }
        } catch (error) {
            toast.error("Error saving question");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditQuestion = (q: Question) => {
        setActiveQuestionId(q.id);
        setQText(q.questionText);
        setQOptions(q.options);
        setQCorrectIndex(q.correctIndex);
        setIsEditingQuestion(true);
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!confirm("Delete this question?")) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/questions/${qId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Question deleted");
                fetchQuiz();
            } else {
                toast.error("Failed to delete question");
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Quiz Editor</h2>
                        <input
                            type="text"
                            value={quiz?.title || "Loading..."}
                            disabled={loading || !quiz}
                            onChange={(e) => quiz && setQuiz({ ...quiz, title: e.target.value })}
                            onBlur={() => handleSaveQuizTitle(quiz?.title || "Quiz")}
                            className="text-sm font-medium text-blue-600 bg-transparent border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors w-full cursor-text"
                            placeholder="Quiz Title"
                        />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {loading && !quiz ? (
                        <div className="text-center py-10 text-gray-500">Loading quiz data...</div>
                    ) : (
                        <>
                            {/* Question List */}
                            {!isEditingQuestion && (
                                <div className="space-y-4">
                                    {quiz?.questions?.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-500 bg-gray-50">
                                            No questions yet. Add one to start building the quiz!
                                        </div>
                                    ) : (
                                        quiz?.questions.map((q, idx) => (
                                            <div key={q.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex gap-4">
                                                <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800 mb-2">{q.questionText}</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className={`px-2 py-1 rounded border ${i === q.correctIndex ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-gray-50 font-medium text-gray-600'}`}>
                                                                {String.fromCharCode(65 + i)}: {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button onClick={() => handleEditQuestion(q)} className="text-blue-600 hover:text-blue-800 text-sm font-medium p-1 hover:bg-blue-50 rounded">Edit</button>
                                                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:text-red-700 text-sm font-medium p-1 hover:bg-red-50 rounded">Delete</button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <button
                                        onClick={() => setIsEditingQuestion(true)}
                                        className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" /> Add Question
                                    </button>
                                </div>
                            )}

                            {/* Question Editor Form */}
                            {isEditingQuestion && (
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Edit2 className="w-4 h-4" /> {activeQuestionId ? "Edit Question" : "New Question"}
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                        <textarea
                                            value={qText}
                                            onChange={e => setQText(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. What does API stand for?"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">Answers (Select the correct one)</label>
                                        {qOptions.map((opt, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${qCorrectIndex === idx ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={qCorrectIndex === idx}
                                                    onChange={() => setQCorrectIndex(idx)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="font-mono text-gray-500 font-bold">{String.fromCharCode(65 + idx)}.</span>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={e => updateOption(idx, e.target.value)}
                                                    className="flex-1 px-2 py-1 outline-none font-medium"
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                                <button onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <button onClick={addOption} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                            <Plus className="w-4 h-4" /> Add another option
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={handleSaveQuestion}
                                            disabled={isSaving}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Question"}
                                        </button>
                                        <button
                                            onClick={resetForm}
                                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isEditingQuestion && (
                    <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                        {quiz && quiz.id !== "NEW" && (
                            <button onClick={handleDeleteQuiz} className="text-sm font-medium text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                                Delete Entire Quiz
                            </button>
                        )}
                        <button onClick={onClose} className="ml-auto bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-black transition-colors">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
