"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
    id: string;
    questionText: string;
    options: string[];
}

interface QuizData {
    id: string;
    title: string;
    questions: Question[];
}

interface QuizSubmissionResult {
    score: number;
    totalQ: number;
    percentage: number;
    gradedAnswers: {
        questionId: string;
        selectedIndex: number | null;
        isCorrect: boolean;
        correctIndex: number;
    }[];
}

export default function QuizModal({
    isOpen,
    onClose,
    courseSlug,
    moduleId,
    onQuizComplete
}: {
    isOpen: boolean;
    onClose: () => void;
    courseSlug: string;
    moduleId: string;
    onQuizComplete: () => void;
}) {
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(false);

    // answers[questionId] = selectedOptionIndex
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<QuizSubmissionResult | null>(null);

    // Track best score from previous attempt
    const [bestScoreRaw, setBestScoreRaw] = useState<number>(0);
    const [bestScoreText, setBestScoreText] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && moduleId && courseSlug) {
            setResult(null);
            setAnswers({});
            fetchQuiz();
        }
    }, [isOpen, moduleId, courseSlug]);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/classroom/${courseSlug}/quiz/${moduleId}`);
            if (res.ok) {
                const data = await res.json();
                setQuiz(data.quiz);
                setBestScoreText(data.bestScore);
                setBestScoreRaw(data.bestScoreRaw);
            } else {
                toast.error("Failed to load quiz");
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading quiz");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        // Ensure all questions are answered
        const unanswered = quiz.questions.filter(q => answers[q.id] === undefined);
        if (unanswered.length > 0) {
            return toast.error(`Harap jawab semua soal! Masih ada ${unanswered.length} soal tersisa.`);
        }

        if (!confirm("Yakin ingin mengumpulkan jawaban?")) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/classroom/${courseSlug}/quiz/${moduleId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                onQuizComplete(); // triggers any confetti/refresh in parent
            } else {
                toast.error("Gagal mengirim kuis.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = () => {
        setResult(null);
        setAnswers({});
        // Optionally refetch if we want to update the best score
        fetchQuiz();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">
                            {quiz?.title || "Kuis Modul"}
                        </h2>
                        {bestScoreText && !result && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 mt-1 inline-block">
                                Skor Tertinggi: {bestScoreText} ({bestScoreRaw}%)
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={submitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <div className="w-8 h-8 border-4 border-[#8B7AFF] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Memuat kuis...</p>
                        </div>
                    ) : result ? (
                        // --- RESULT SCREEN ---
                        <div className="flex flex-col items-center">
                            <div className="mb-6 text-center animate-in fade-in zoom-in duration-500">
                                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 ${result.percentage >= 80 ? 'bg-emerald-100 text-emerald-600' : result.percentage >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                    <span className="text-3xl font-bold">{result.percentage}%</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {result.percentage >= 80 ? "Luar Biasa! 🎉" : result.percentage >= 60 ? "Kerja Bagus! 👍" : "Jangan Menyerah! 💪"}
                                </h3>
                                <p className="text-gray-500 mt-2 font-medium">
                                    Kamu menjawab {result.score} benar dari {result.totalQ} pertanyaan.
                                </p>
                            </div>

                            <div className="w-full space-y-4 border-t border-gray-100 pt-6">
                                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Review Jawaban:</h4>
                                {quiz?.questions.map((q, i) => {
                                    const graded = result.gradedAnswers.find(ga => ga.questionId === q.id);
                                    if (!graded) return null;

                                    return (
                                        <div key={q.id} className={`p-4 rounded-xl border-2 ${graded.isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
                                            <div className="flex gap-3">
                                                <div className="mt-1 shrink-0">
                                                    {graded.isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm leading-relaxed">{q.questionText}</p>
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold uppercase text-gray-500 w-16">Jawabanmu:</span>
                                                            <span className={`text-sm font-medium ${graded.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                                                {graded.selectedIndex !== null ? q.options[graded.selectedIndex] : "Tidak Dijawab"}
                                                            </span>
                                                        </div>
                                                        {!graded.isCorrect && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-semibold uppercase text-gray-500 w-16">Seharusnya:</span>
                                                                <span className="text-sm font-medium text-emerald-700">
                                                                    {q.options[graded.correctIndex]}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        // --- QUIZ QUESTIONS SCREEN ---
                        <div className="space-y-8 pb-4">
                            {quiz?.questions.map((q, idx) => (
                                <div key={q.id} className="bg-white">
                                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-5 flex items-start gap-2">
                                        <span className="text-[#8B7AFF] mt-0.5">{idx + 1}.</span>
                                        <span>{q.questionText}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {q.options.map((opt, oIdx) => {
                                            const isSelected = answers[q.id] === oIdx;
                                            return (
                                                <div
                                                    key={oIdx}
                                                    onClick={() => handleOptionSelect(q.id, oIdx)}
                                                    className={`
                                                        flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
                                                        ${isSelected
                                                            ? 'border-[#8B7AFF] bg-[#F3F0FF] text-[#8B7AFF] shadow-sm'
                                                            : 'border-gray-100 hover:border-[#D0C7FF] hover:bg-gray-50 text-gray-700'
                                                        }
                                                    `}
                                                >
                                                    <div className={`
                                                        w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center mr-4 transition-colors duration-300
                                                        ${isSelected ? 'border-[#8B7AFF] bg-[#8B7AFF]' : 'border-gray-300 bg-white'}
                                                    `}>
                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in duration-200" />}
                                                    </div>
                                                    <span className={`font-semibold text-[15px] ${isSelected ? 'text-[#8B7AFF]' : 'text-gray-700'}`}>{opt}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    {result ? (
                        <div className="flex gap-4">
                            <button onClick={handleRetry} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors">
                                Ulangi Kuis
                            </button>
                            <button onClick={onClose} className="flex-1 bg-[#8B7AFF] text-white py-3.5 rounded-xl font-bold hover:bg-[#7E6CE0] transition-colors shadow-lg shadow-[#8B7AFF]/30">
                                Lanjut Belajar
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!quiz || loading || submitting}
                            className="w-full bg-[#8B7AFF] text-white py-4 rounded-2xl font-bold text-[15px] hover:bg-[#7E6CE0] transition-all shadow-lg shadow-[#8B7AFF]/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                        >
                            {submitting ? "Mengirim Jawaban..." : "Selesai & Kumpulkan Jawaban"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
