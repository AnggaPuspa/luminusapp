"use client";

import { useEffect, useState } from "react";
import { X, CheckCircleIcon, XCircleIcon, ClockIcon, AlertTriangle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface OrderDetailDrawerProps {
    orderId: string | null;
    onClose: () => void;
    onStatusUpdated: () => void;
}

export default function OrderDetailDrawer({ orderId, onClose, onStatusUpdated }: OrderDetailDrawerProps) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const isOpen = !!orderId;

    useEffect(() => {
        if (orderId) {
            setLoading(true);
            fetchOrder(orderId);
        } else {
            setOrder(null);
        }
    }, [orderId]);

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

    const fetchOrder = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            if (!res.ok) throw new Error("Order not found");
            const data = await res.json();
            setOrder(data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat detail order");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: "PAID" | "FAILED" | "EXPIRED") => {
        if (!orderId) return;
        if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Gagal mengubah status");
            }

            toast.success(`Status order diperbarui ke ${newStatus}`);
            fetchOrder(orderId);
            onStatusUpdated();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Terjadi kesalahan");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PAID": return {
                icon: <CheckCircleIcon className="w-5 h-5" />,
                label: "Lunas",
                bg: "bg-green-50", border: "border-green-200", text: "text-green-700",
                dot: "bg-green-500"
            };
            case "PENDING": return {
                icon: <ClockIcon className="w-5 h-5" />,
                label: "Menunggu",
                bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700",
                dot: "bg-amber-500"
            };
            case "FAILED": return {
                icon: <XCircleIcon className="w-5 h-5" />,
                label: "Gagal",
                bg: "bg-red-50", border: "border-red-200", text: "text-red-700",
                dot: "bg-red-500"
            };
            case "EXPIRED": return {
                icon: <AlertTriangle className="w-5 h-5" />,
                label: "Kedaluwarsa",
                bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600",
                dot: "bg-gray-400"
            };
            default: return {
                icon: null, label: status,
                bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600",
                dot: "bg-gray-400"
            };
        }
    };

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
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                            <span className="text-[13px] text-gray-400 font-medium">Memuat detail...</span>
                        </div>
                    </div>
                ) : order ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-[15px] font-bold text-[#1a1a1a]">Detail Transaksi</h2>
                                <p className="text-[12px] text-gray-400 font-mono mt-0.5">#{order.id.slice(-8)}</p>
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
                                const sc = getStatusConfig(order.status);
                                return (
                                    <div className={`mx-6 mt-5 rounded-xl ${sc.bg} border ${sc.border} p-4`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`${sc.text}`}>{sc.icon}</div>
                                                <div>
                                                    <p className={`text-[13px] font-bold ${sc.text}`}>{sc.label}</p>
                                                    <p className={`text-[11px] ${sc.text} opacity-70 mt-0.5`}>
                                                        {order.status === "PAID"
                                                            ? `Dibayar ${format(new Date(order.paidAt || order.updatedAt), "dd MMM yyyy, HH:mm", { locale: localeId })}`
                                                            : `Dibuat ${format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <p className={`text-[18px] font-bold font-mono ${sc.text}`}>
                                                {order.amount === 0 ? "Gratis" : `Rp ${order.amount.toLocaleString("id-ID")}`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Sections */}
                            <div className="px-6 py-5 space-y-5">
                                {/* Customer */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Pelanggan</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Nama</span>
                                            <span className="text-[13px] font-semibold text-[#1a1a1a]">{order.user?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Email</span>
                                            <span className="text-[13px] text-[#1a1a1a]">{order.user?.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">User ID</span>
                                            <span className="text-[11px] font-mono text-gray-400">{order.user?.id?.slice(-12)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Course */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Kursus</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                        {order.course?.thumbnailUrl ? (
                                            <img src={order.course.thumbnailUrl} alt="" className="w-14 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                                        ) : (
                                            <div className="w-14 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                                        )}
                                        <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2">{order.course?.title}</p>
                                    </div>
                                </div>

                                {/* Coupon */}
                                {order.couponId && (
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Kupon</h4>
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[12px] text-gray-500">Kupon ID</span>
                                                <span className="text-[11px] font-mono text-gray-400">{order.couponId?.slice(-12)}</span>
                                            </div>
                                            {order.discountAmount && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[12px] text-gray-500">Diskon</span>
                                                    <span className="text-[13px] font-semibold text-green-600">- Rp {order.discountAmount.toLocaleString("id-ID")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Gateway */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment Gateway</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Invoice ID</span>
                                            <span className="text-[11px] font-mono text-gray-500 truncate max-w-[200px]" title={order.paymentToken}>{order.paymentToken || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Metode</span>
                                            <span className="text-[13px] text-[#1a1a1a]">{order.paymentMethod || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Channel</span>
                                            <span className="text-[13px] text-[#1a1a1a] uppercase">{order.paymentChannel || "N/A"}</span>
                                        </div>
                                        {order.paymentUrl && (
                                            <a
                                                href={order.paymentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-[12px] text-[#4F46E5] font-medium hover:underline pt-1"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Buka di Mayar
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Webhook Logs */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                                        Webhook Logs
                                        <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{order.webhookLogs?.length || 0}</span>
                                    </h4>
                                    {order.webhookLogs && order.webhookLogs.length > 0 ? (
                                        <div className="space-y-2">
                                            {order.webhookLogs.map((log: any) => (
                                                <details key={log.id} className="group bg-gray-50 rounded-xl overflow-hidden">
                                                    <summary className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.httpStatus === 200 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                            <span className="text-[12px] font-semibold text-[#1a1a1a]">{log.event}</span>
                                                        </div>
                                                        <span className="text-[11px] text-gray-400">
                                                            {format(new Date(log.receivedAt), "dd MMM HH:mm:ss", { locale: localeId })}
                                                        </span>
                                                    </summary>
                                                    <pre className="mx-3 mb-3 text-[11px] text-gray-300 bg-[#1a1a1a] p-3 rounded-lg overflow-x-auto max-h-[200px]">
                                                        {JSON.stringify(log.payload, null, 2)}
                                                    </pre>
                                                </details>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[12px] text-gray-400 text-center py-4 bg-gray-50 rounded-xl">Belum ada webhook log.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {order.status === "PENDING" && (
                            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
                                <button
                                    onClick={() => handleUpdateStatus("PAID")}
                                    disabled={updating}
                                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-[13px] font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {updating ? "Memproses..." : "Tandai Lunas"}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("FAILED")}
                                    disabled={updating}
                                    className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[13px] font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                                >
                                    Tandai Gagal
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </>
    );
}
