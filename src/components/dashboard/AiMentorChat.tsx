"use client";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

interface AiMentorChatProps {
    isSubscriber: boolean;
    aiQuotaRemaining: number;
    onClose?: () => void;
}

export default function AiMentorChat({ isSubscriber, aiQuotaRemaining, onClose }: AiMentorChatProps) {
    const [localQuota, setLocalQuota] = useState(aiQuotaRemaining);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/ai/mentor',
        }),
        onFinish() {
            setLocalQuota(prev => Math.max(0, prev - 1));
        },
        onError(error: Error) {
            toast.error(error.message || "Terjadi kesalahan saat menghubungi AI Mentor");
        }
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSubscriber) {
            toast.error("Upgrade langganan untuk menggunakan AI Mentor.");
            return;
        }
        if (localQuota > 0 || localQuota === Infinity) {
            if (input.trim()) {
                sendMessage({ text: input });
                setInput('');
            }
        } else {
            toast.error("Kuota pesan AI habis bulan ini.");
        }
    };

    const getMessageText = (m: any): string => {
        if (m.parts && Array.isArray(m.parts)) {
            return m.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('');
        }
        return m.content || '';
    };

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden flex flex-col h-[550px] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-[#696EFF] to-[#8B7AFF] relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-white/5 rounded-full" />

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[14px] text-white leading-tight">Luminus AI Mentor</h3>
                        <p className="text-[10px] text-white/70 font-medium">Powered by Qwen-Plus</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                    {isSubscriber && localQuota !== Infinity && (
                        <span className="text-[10px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {localQuota} sisa
                        </span>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#FAFAFA]">
                {!isSubscriber ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                        <div className="w-16 h-16 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                            <Bot className="w-8 h-8 text-[#8B7AFF]" />
                        </div>
                        <div className="max-w-[260px]">
                            <p className="font-bold text-[15px] text-gray-900">Butuh AI Mentor?</p>
                            <p className="text-[12px] text-gray-400 font-medium mt-2 leading-relaxed">
                                Upgrade ke paket langganan untuk konsultasi karir tech, review coding, dan persiapan interview secara live.
                            </p>
                        </div>
                        <a
                            href="/pricing"
                            className="mt-2 px-6 py-2.5 rounded-full bg-[#696EFF] text-white text-sm font-semibold hover:bg-[#585cee] transition-colors shadow-sm shadow-[#696EFF]/30"
                        >
                            Lihat Paket Langganan
                        </a>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-6">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-50">
                            <Bot className="w-7 h-7 text-[#696EFF]" />
                        </div>
                        <div className="max-w-[240px]">
                            <p className="font-bold text-[15px] text-gray-900">Halo! 👋</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-1.5 leading-relaxed">
                                Siap bantu belajar coding, persiapan karir, dan review portfolio kamu.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-center mt-3 px-2">
                            {["Tips interview frontend", "Review portfolio", "Belajar React dari nol"].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage({ text: q })}
                                    className="text-[11px] font-medium text-[#696EFF] bg-white px-3 py-2 rounded-xl border border-gray-100 hover:bg-[#696EFF] hover:text-white hover:border-[#696EFF] transition-all shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((m: any) => (
                            <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role !== 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-[#696EFF] flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-[#696EFF]/20">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                                <div className={`px-3.5 py-2.5 rounded-2xl max-w-[80%] text-[13px] leading-relaxed ${m.role === 'user'
                                    ? 'bg-[#696EFF] text-white rounded-br-md shadow-sm'
                                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-50 whitespace-pre-wrap'
                                    }`}>
                                    {getMessageText(m)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2.5 justify-start">
                                <div className="w-7 h-7 rounded-full bg-[#696EFF] flex items-center justify-center shrink-0 shadow-sm shadow-[#696EFF]/20">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-white rounded-bl-md flex items-center gap-1.5 shadow-sm border border-gray-50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#696EFF]/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#696EFF]/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#696EFF]/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-2 text-[11px] text-red-500 bg-red-50 p-2.5 rounded-xl font-medium">
                                <span>⚠️</span>
                                <span>Error: {error.message}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <form
                    onSubmit={handleFormSubmit}
                    className="flex items-center gap-2 bg-[#F4F4F5] rounded-full px-4 py-1"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            !isSubscriber ? "Upgrade untuk chat..."
                                : (localQuota > 0 || localQuota === Infinity) ? "Tanya AI Mentor..."
                                    : "Kuota habis bulan ini"
                        }
                        disabled={!isSubscriber || isLoading || (localQuota <= 0 && localQuota !== Infinity)}
                        className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 outline-none py-2.5 font-medium disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!isSubscriber || isLoading || !input.trim() || (localQuota <= 0 && localQuota !== Infinity)}
                        className="w-8 h-8 rounded-full bg-[#696EFF] flex items-center justify-center text-white hover:bg-[#585cee] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm shadow-[#696EFF]/30"
                    >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
