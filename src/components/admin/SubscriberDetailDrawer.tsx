"use client";

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle2, XCircle, AlertCircle, ClockIcon, Crown, Zap, Sparkles, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface SubscriberDrawerProps {
    subscriber: any | null;
    onClose: () => void;
    onAction: () => void;
}

export default function SubscriberDetailDrawer({ subscriber, onClose, onAction }: SubscriberDrawerProps) {
    const [updating, setUpdating] = useState(false);
    const isOpen = !!subscriber;

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleApprove = async () => {
        if (!subscriber) return;
        if (!confirm("Approve manual (Acc) subscription ini? Status akan otomatis jadi AKTIF.")) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/subscribers/${subscriber.id}/approve`, { method: "POST" });
            if (res.ok) {
                toast.success("Subscription berhasil di-Acc Manual");
                onAction();
                onClose();
            } else {
                toast.error("Gagal Acc subscription");
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan");
        } finally {
            setUpdating(false);
        }
    };

    const handleSuspend = async () => {
        if (!subscriber) return;
        if (!confirm("Suspend (tangguhkan) akses user ini? Status akan menjadi EXPIRED.")) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/subscribers/${subscriber.id}/suspend`, { method: "POST" });
            if (res.ok) {
                toast.success("Subscription berhasil ditangguhkan");
                onAction();
                onClose();
            } else {
                toast.error("Gagal menangguhkan subscription");
            }
        } catch {
            toast.error("Terjadi kesalahan jaringan");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "ACTIVE": return {
                icon: <CheckCircle2 className="w-5 h-5" />,
                label: "Aktif",
                bg: "bg-green-50", border: "border-green-200", text: "text-green-700"
            };
            case "PAST_DUE": return {
                icon: <AlertCircle className="w-5 h-5" />,
                label: "Menunggak",
                bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700"
            };
            case "PENDING": return {
                icon: <ClockIcon className="w-5 h-5" />,
                label: "Belum Bayar",
                bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600"
            };
            case "EXPIRED":
            case "CANCELLED": return {
                icon: <XCircle className="w-5 h-5" />,
                label: "Berakhir",
                bg: "bg-red-50", border: "border-red-200", text: "text-red-700"
            };
            default: return {
                icon: null, label: status,
                bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600"
            };
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier?.toUpperCase()) {
            case "GOLD": return <Crown className="w-4 h-4 text-yellow-500" />;
            case "SILVER": return <Zap className="w-4 h-4 text-gray-400" />;
            case "BRONZE": return <Sparkles className="w-4 h-4 text-amber-600" />;
            default: return null;
        }
    };

    const sub = subscriber;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {sub ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-[15px] font-bold text-[#1a1a1a]">Detail Langganan</h2>
                                <p className="text-[12px] text-gray-400 font-mono mt-0.5">#{sub.id.slice(-8)}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Status Banner */}
                            {(() => {
                                const sc = getStatusConfig(sub.status);
                                return (
                                    <div className={`mx-6 mt-5 rounded-xl ${sc.bg} border ${sc.border} p-4`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`${sc.text}`}>{sc.icon}</div>
                                            <div>
                                                <p className={`text-[13px] font-bold ${sc.text}`}>{sc.label}</p>
                                                <p className={`text-[11px] ${sc.text} opacity-70 mt-0.5`}>
                                                    Siklus: {sub.billingCycle === "YEARLY" ? "Tahunan" : "Bulanan"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Sections */}
                            <div className="px-6 py-5 space-y-5">
                                {/* Subscriber */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Siswa</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Nama</span>
                                            <span className="text-[13px] font-semibold text-[#1a1a1a]">{sub.user?.name || "Unknown"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Email</span>
                                            <span className="text-[13px] text-[#1a1a1a]">{sub.user?.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">User ID</span>
                                            <span className="text-[11px] font-mono text-gray-400">{sub.user?.id?.slice(-12)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Plan */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Paket Langganan</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Paket</span>
                                            <span className="text-[13px] font-semibold text-[#1a1a1a]">{sub.plan?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Tier</span>
                                            <div className="flex items-center gap-1.5">
                                                {getTierIcon(sub.plan?.tier)}
                                                <span className="text-[13px] font-semibold text-[#4F46E5] uppercase">{sub.plan?.tier}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Siklus</span>
                                            <span className="text-[13px] text-[#1a1a1a]">{sub.billingCycle === "YEARLY" ? "Tahunan" : "Bulanan"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Period */}
                                {sub.status !== "PENDING" && (
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Masa Aktif</h4>
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[12px] text-gray-500">Mulai</span>
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">
                                                    {format(new Date(sub.currentPeriodStart), "dd MMM yyyy", { locale: localeId })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[12px] text-gray-500">Berakhir</span>
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">
                                                    {format(new Date(sub.currentPeriodEnd), "dd MMM yyyy", { locale: localeId })}
                                                </span>
                                            </div>
                                            {(() => {
                                                const daysLeft = Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                if (daysLeft < 0) return null;
                                                return (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[12px] text-gray-500">Sisa</span>
                                                        <span className={`text-[13px] font-semibold ${daysLeft <= 7 ? 'text-red-500' : daysLeft <= 14 ? 'text-amber-500' : 'text-green-600'}`}>
                                                            {daysLeft} hari
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* AI Usage */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Pemakaian AI Mentor</h4>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[12px] text-gray-500">Bulan Ini</span>
                                            <span className="text-[13px] font-bold text-[#1a1a1a]">
                                                {sub.aiChatUsedThisMonth} / {sub.plan?.aiMentorQuota || 0}
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    sub.plan?.aiMentorQuota > 0 && (sub.aiChatUsedThisMonth / sub.plan.aiMentorQuota) >= 0.9
                                                        ? 'bg-red-500'
                                                        : (sub.aiChatUsedThisMonth / (sub.plan?.aiMentorQuota || 1)) >= 0.6
                                                            ? 'bg-amber-500'
                                                            : 'bg-[#4F46E5]'
                                                }`}
                                                style={{
                                                    width: sub.plan?.aiMentorQuota > 0
                                                        ? `${Math.min(100, Math.round((sub.aiChatUsedThisMonth / sub.plan.aiMentorQuota) * 100))}%`
                                                        : '0%'
                                                }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-2 text-right">
                                            {sub.plan?.aiMentorQuota > 0
                                                ? `${Math.round((sub.aiChatUsedThisMonth / sub.plan.aiMentorQuota) * 100)}% terpakai`
                                                : "Tidak ada kuota"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {sub.status === "PENDING" && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-white">
                                <button
                                    onClick={handleApprove}
                                    disabled={updating}
                                    className="w-full py-2.5 bg-green-600 text-white rounded-xl text-[13px] font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {updating ? "Memproses..." : "Setujui Langganan"}
                                </button>
                            </div>
                        )}
                        {sub.status === "ACTIVE" && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-white">
                                <button
                                    onClick={handleSuspend}
                                    disabled={updating}
                                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[13px] font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                                >
                                    {updating ? "Memproses..." : "Tangguhkan Langganan"}
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </>
    );
}
