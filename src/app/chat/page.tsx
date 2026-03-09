'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from '@/components/common';
import {
  ChatHeader,
  ChatMessage,
  TopicSelection,
  QuestionCountSelection,
  QuizSection,
} from '@/components/chat';
import { topics, Question } from '@/data/questions';
import '@/styles/chat.css';
import '@/styles/common.css';
import Link from 'next/link';
import { Loader2, Trophy, Star, BookOpen, ArrowRight, RotateCcw } from 'lucide-react';

interface Message {
  content: string;
  isBot: boolean;
}

interface AssessmentResult {
  level: string;
  score: string;
  percentage: number;
  summary: string;
  recommendation: string;
  recommendedCourseSlug: string | null;
  recommendedCourseTitle?: string;
  recommendedCourseThumbnail?: string;
}

const DELAY = 800;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showTopicSelection, setShowTopicSelection] = useState(false);
  const [showQuestionCount, setShowQuestionCount] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [currentTopic, setCurrentTopic] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ question: string; userAnswer: string; correct: string; difficulty: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const addMessage = (content: string, isBot: boolean = true) => {
    setMessages((prev) => [...prev, { content, isBot }]);
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showQuiz, result]);

  useEffect(() => {
    addMessage('Halo! 👋 Saya Luminus AI — saya akan bantu analisa skill kamu lewat quiz singkat.');
    setTimeout(() => {
      addMessage('Pilih topik yang ingin kamu test:');
      setShowTopicSelection(true);
    }, DELAY);
  }, []);

  const handleTopicSelect = (topicId: string) => {
    setCurrentTopic(topicId);
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      addMessage(`${topic.icon} ${topic.label}`, false);
    }
    setShowTopicSelection(false);

    setTimeout(() => {
      addMessage('Berapa banyak pertanyaan yang mau kamu jawab?');
      setShowQuestionCount(true);
    }, DELAY);
  };

  const handleQuestionCountSelect = async (count: number) => {
    setTotalQuestions(count);
    setShowQuestionCount(false);
    addMessage(`${count} pertanyaan`, false);

    setTimeout(() => {
      addMessage('⏳ Sedang membuat soal yang disesuaikan dengan level kamu...');
    }, 300);

    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'generate', topic: currentTopic, questionCount: count }),
      });

      if (!res.ok) throw new Error('Failed to generate');

      const data = await res.json();
      const questions = data.questions as Question[];

      setAiQuestions(questions);
      setCurrentQuestion(0);
      setUserAnswers([]);

      // Remove loading message and show ready
      setMessages(prev => prev.filter(m => m.content !== '⏳ Sedang membuat soal yang disesuaikan dengan level kamu...'));
      addMessage(`✅ ${questions.length} soal siap! Dari level easy sampai hard. Yuk mulai!`);

      setTimeout(() => {
        setShowQuiz(true);
      }, DELAY);
    } catch (e) {
      setMessages(prev => prev.filter(m => m.content !== '⏳ Sedang membuat soal yang disesuaikan dengan level kamu...'));
      addMessage('❌ Gagal membuat soal. Coba lagi ya!');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentQuestion = (): Question | null => {
    if (aiQuestions.length === 0) return null;
    return aiQuestions[currentQuestion] || null;
  };

  const handleAnswer = (answer: string) => {
    const question = getCurrentQuestion();
    if (!question) return;

    const selectedOption = question.options.find((opt) => opt.value === answer);
    if (selectedOption) {
      addMessage(selectedOption.label, false);
    }

    // Track answer
    setUserAnswers(prev => [...prev, {
      question: question.question,
      userAnswer: answer,
      correct: question.correct,
      difficulty: (question as any).difficulty || 'medium',
    }]);

    const nextQuestion = currentQuestion + 1;
    setCurrentQuestion(nextQuestion);
    setShowQuiz(false);

    if (nextQuestion < aiQuestions.length) {
      setTimeout(() => {
        setShowQuiz(true);
      }, DELAY);
    } else {
      // Done — analyze results
      setTimeout(() => {
        analyzeResults([...userAnswers, {
          question: question.question,
          userAnswer: answer,
          correct: question.correct,
          difficulty: (question as any).difficulty || 'medium',
        }]);
      }, DELAY);
    }
  };

  const analyzeResults = async (finalAnswers: typeof userAnswers) => {
    setIsAnalyzing(true);
    addMessage('🧠 Menganalisa jawaban kamu...');

    try {
      const res = await fetch('/api/ai/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'analyze', topic: currentTopic, answers: finalAnswers }),
      });

      if (!res.ok) throw new Error('Failed to analyze');

      const data = await res.json();
      setResult(data);
      setMessages(prev => prev.filter(m => m.content !== '🧠 Menganalisa jawaban kamu...'));
    } catch (e) {
      setMessages(prev => prev.filter(m => m.content !== '🧠 Menganalisa jawaban kamu...'));
      addMessage('❌ Gagal menganalisa. Coba lagi ya!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setShowTopicSelection(false);
    setShowQuestionCount(false);
    setShowQuiz(false);
    setCurrentTopic('');
    setCurrentQuestion(0);
    setTotalQuestions(5);
    setAiQuestions([]);
    setUserAnswers([]);
    setResult(null);
    setIsGenerating(false);
    setIsAnalyzing(false);

    setTimeout(() => {
      addMessage('Halo! 👋 Saya Luminus AI — saya akan bantu analisa skill kamu lewat quiz singkat.');
      setTimeout(() => {
        addMessage('Pilih topik yang ingin kamu test:');
        setShowTopicSelection(true);
      }, DELAY);
    }, 100);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'Intermediate': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    }
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'Advanced': return '🔥';
      case 'Intermediate': return '⚡';
      default: return '🌱';
    }
  };

  return (
    <>
      <div className="w-full md:w-[80%] mx-auto h-screen flex items-center justify-center">
        <div className="w-full h-full md:p-3 flex flex-col">
          <ChatHeader onReset={handleReset} />

          <div className="bg-white h-full md:h-auto pt-3 md:rounded-b-2xl overflow-hidden">
            <div className="h-full md:h-[38rem] flex flex-col">
              {/* Chat messages */}
              <div
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
              >
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    content={message.content}
                    isBot={message.isBot}
                  />
                ))}

                {/* Loading States */}
                {(isGenerating || isAnalyzing) && (
                  <div className="flex items-center gap-3 py-3">
                    <Loader2 className="w-5 h-5 text-[#696eff] animate-spin" />
                    <span className="text-gray-500 text-sm">
                      {isGenerating ? 'AI sedang menyiapkan soal...' : 'AI sedang menganalisa...'}
                    </span>
                  </div>
                )}

                {/* Result Card */}
                {result && (
                  <div className="my-4 rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                    <div className={`${getLevelColor(result.level)} p-6 text-white`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getLevelEmoji(result.level)}</span>
                        <div>
                          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Skill Level Kamu</p>
                          <h3 className="text-2xl font-bold">{result.level}</h3>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                          <p className="text-xs text-white/80">Skor</p>
                          <p className="text-lg font-bold">{result.score}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                          <p className="text-xs text-white/80">Akurasi</p>
                          <p className="text-lg font-bold">{result.percentage}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-5 bg-white">
                      <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
                    </div>

                    {/* Recommendation */}
                    <div className="px-5 pb-5 bg-white border-t border-gray-50">
                      <div className="flex items-center gap-2 mt-4 mb-3">
                        <BookOpen className="w-4 h-4 text-[#696eff]" />
                        <h4 className="font-bold text-sm text-gray-900">Rekomendasi Kelas</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{result.recommendation}</p>

                      <div className="flex gap-3">
                        {result.recommendedCourseSlug && (
                          <Link
                            href={`/kursus/${result.recommendedCourseSlug}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#696eff] text-white text-sm font-bold rounded-xl hover:bg-[#5a5ee6] transition-colors"
                          >
                            Lihat Kelas <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={handleReset}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" /> Ulang
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Topic selection */}
              <TopicSelection
                topics={topics}
                onSelect={handleTopicSelect}
                visible={showTopicSelection}
              />

              {/* Question count selection */}
              <QuestionCountSelection
                onSelect={handleQuestionCountSelect}
                visible={showQuestionCount && !isGenerating}
              />

              {/* Quiz section */}
              <QuizSection
                question={getCurrentQuestion()}
                currentQuestion={currentQuestion}
                totalQuestions={aiQuestions.length}
                onAnswer={handleAnswer}
                visible={showQuiz && !isGenerating}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
