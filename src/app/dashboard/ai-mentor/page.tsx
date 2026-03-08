"use client";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StudentTopbar from '@/components/dashboard/StudentTopbar';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDashboardOverview } from '@/hooks/use-dashboard';

export default function AiMentorPage() {
    const [input, setInput] = useState('');
    const [quotaOffset, setQuotaOffset] = useState(0); // tracks client-side quota decrements
    const scrollRef = useRef<HTMLDivElement>(null);

    const { stats, isLoading: swrLoading } = useDashboardOverview();
    const isSubscriber = !!stats?.subscription?.isSubscriber;
    const loaded = !swrLoading;
    const quota = Math.max(0, (stats?.subscription?.aiQuotaRemaining ?? 0) - quotaOffset);

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/ai/mentor',
        }),
        onFinish() {
            setQuotaOffset(prev => prev + 1);
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
        if (quota > 0 || quota === Infinity) {
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

    if (!loaded) {
        return (
            <div className="flex flex-col h-full">
                <StudentTopbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#696EFF] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <StudentTopbar />

            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 mt-6 shadow-sm overflow-hidden mb-6">
                {/* Clean Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100">
                            <Image src="/images/ai.png" alt="Luminus AI" width={48} height={48} className="object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[18px] text-gray-900 leading-tight">Luminus AI Mentor</h3>
                            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Powered by Qwen-Plus</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isSubscriber && quota !== Infinity && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-bold rounded-full uppercase tracking-wide">
                                {quota} Sisa Kuota
                            </span>
                        )}
                        {isSubscriber && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#38BDF8] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-[#BAE6FD]" />
                                Online
                            </span>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#FAFAFA] flex flex-col scrollbar-hide">
                    {!isSubscriber ? (
                        <div className="m-auto flex flex-col items-center justify-center text-center max-w-md p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mb-6">
                                <Image src="/images/ai.png" alt="AI" width={56} height={56} className="opacity-50 grayscale" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-3">Akses AI Mentor Terkunci</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Upgrade paket langganan kamu untuk berdiskusi seputar karir tech, review kode, dan simulasi interview bersama Expert AI kami.
                            </p>
                            <a
                                href="/pricing"
                                className="px-8 py-3 rounded-xl bg-[#696EFF] text-white text-sm font-semibold hover:bg-[#585cee] transition-colors shadow-[0_4px_14px_0_rgba(105,110,255,0.39)] hover:shadow-[0_6px_20px_rgba(105,110,255,0.23)] hover:-translate-y-0.5"
                            >
                                Lihat Opsi Berlangganan
                            </a>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="m-auto flex flex-col items-center justify-center text-center w-full max-w-2xl py-8">
                            <div className="w-20 h-20 rounded-full border border-gray-100 shadow-sm overflow-hidden bg-white mb-6">
                                <Image src="/images/ai.png" alt="Luminus AI" width={80} height={80} className="object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Halo! Apa yang ingin dipelajari hari ini? 👋</h2>
                            <p className="text-[15px] text-gray-500 mb-10 max-w-lg">
                                Saya adalah AI Mentor pribadimu. Berikut beberapa hal yang bisa kita diskusikan:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                {[
                                    { title: "Review Kode", desc: "Berikan snippet kode untuk direview" },
                                    { title: "Simulasi Interview", desc: "Latihan interview technical / HR" },
                                    { title: "Roadmap Belajar", desc: "Buat panduan karir langkah-demi-langkah" },
                                    { title: "Debugging Error", desc: "Bantu temukan bug yang tersembunyi" }
                                ].map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage({ text: q.title })}
                                        className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-[#696EFF] hover:ring-1 hover:ring-[#696EFF] transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <p className="font-semibold text-gray-900 group-hover:text-[#696EFF] text-[15px]">{q.title}</p>
                                        <p className="text-sm text-gray-500 mt-1">{q.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto w-full space-y-6">
                            {messages.map((m: any) => (
                                <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {m.role !== 'user' && (
                                        <div className="w-10 h-10 rounded-full mt-1 border border-gray-100 shadow-sm overflow-hidden shrink-0 bg-white">
                                            <Image src="/images/ai.png" alt="AI" width={40} height={40} className="object-cover" />
                                        </div>
                                    )}
                                    <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relative ${m.role === 'user'
                                        ? 'bg-[#696EFF] text-white rounded-br-sm shadow-md'
                                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                                        }`}>
                                        {m.role === 'user' ? (
                                            <div className="whitespace-pre-wrap">{getMessageText(m)}</div>
                                        ) : (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 mt-5 text-gray-900" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 mt-4 text-gray-900" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-4 text-gray-900" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                                                    a: ({ node, ...props }) => <a className="text-[#696EFF] hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                                    code: ({ node, className, children, ...props }: any) => {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        const inline = !match && !className;
                                                        return inline ? (
                                                            <code className="bg-gray-100 text-[#8B7AFF] px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <div className="relative my-4 rounded-xl overflow-hidden bg-gray-900 shadow-sm border border-gray-800">
                                                                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700/50">
                                                                    <span className="text-[11px] font-mono text-gray-400 font-medium uppercase tracking-wider">{match?.[1] || 'code'}</span>
                                                                </div>
                                                                <div className="p-4 overflow-x-auto bg-[#0D1117]">
                                                                    <code className={`text-[13px] font-mono text-gray-200 ${className || ''}`} {...props}>
                                                                        {children}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                }}
                                            >
                                                {getMessageText(m)}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                    {m.role === 'user' && (
                                        <div className="w-10 h-10 rounded-full mt-1 shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-200">
                                            {/* Could use user avatar here, fallback to initial */}
                                            <span className="font-bold text-gray-500">U</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-4 justify-start">
                                    <div className="w-10 h-10 rounded-full mt-1 border border-gray-100 shadow-sm overflow-hidden shrink-0 bg-white">
                                        <Image src="/images/ai.png" alt="AI" width={40} height={40} className="object-cover" />
                                    </div>
                                    <div className="px-6 py-4 rounded-2xl bg-white rounded-bl-sm flex items-center gap-1.5 shadow-sm border border-gray-200">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#696EFF] animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#696EFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#696EFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-3 text-[14px] text-red-600 bg-red-50 p-4 rounded-xl font-medium border border-red-100 m-auto max-w-2xl">
                                    <span className="text-xl">⚠️</span>
                                    <span>Ops, terjadi masalah: {error.message}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                    <form
                        onSubmit={handleFormSubmit}
                        className="flex flex-col gap-2 max-w-4xl mx-auto"
                    >
                        <div className="flex items-center gap-3 bg-white border-2 border-gray-200 focus-within:border-[#696EFF] rounded-2xl px-5 py-2 transition-colors shadow-sm focus-within:shadow-md">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={
                                    !isSubscriber ? "Aktifkan langganan untuk berinteraksi..."
                                        : (quota > 0 || quota === Infinity) ? "Tanya sesuatu ke AI Mentor..."
                                            : "Batas penggunaan AI bulanan telah tercapai"
                                }
                                disabled={!isSubscriber || isLoading || (quota <= 0 && quota !== Infinity)}
                                className="flex-1 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none py-3 font-medium disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!isSubscriber || isLoading || !input.trim() || (quota <= 0 && quota !== Infinity)}
                                className="w-12 h-12 rounded-xl bg-[#696EFF] flex items-center justify-center text-white hover:bg-[#585cee] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-[0_4px_14px_0_rgba(105,110,255,0.39)] hover:shadow-[0_6px_20px_rgba(105,110,255,0.23)] hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                            </button>
                        </div>
                        <p className="text-center text-[11px] text-gray-400 mt-1 font-medium">
                            AI dapat membuat kesalahan. Harap periksa kembali informasi penting.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
