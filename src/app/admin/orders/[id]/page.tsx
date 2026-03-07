"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircleIcon, XCircleIcon, ClockIcon, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            if (!res.ok) throw new Error("Order not found");
            const data = await res.json();
            setOrder(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load order details");
            router.push("/admin/orders");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: "PAID" | "FAILED" | "EXPIRED") => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to update status");
            }

            toast.success(`Order status updated to ${newStatus}`);
            fetchOrder(); // Refresh data
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "An error occurred");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PAID": return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
            case "PENDING": return <ClockIcon className="w-8 h-8 text-amber-500" />;
            case "FAILED": return <XCircleIcon className="w-8 h-8 text-red-500" />;
            case "EXPIRED": return <AlertTriangle className="w-8 h-8 text-gray-500" />;
            default: return null;
        }
    };

    const getStatusTextClasses = (status: string) => {
        switch (status) {
            case "PAID": return "text-green-700 bg-green-50 border-green-200";
            case "PENDING": return "text-amber-700 bg-amber-50 border-amber-200";
            case "FAILED": return "text-red-700 bg-red-50 border-red-200";
            case "EXPIRED": return "text-gray-700 bg-gray-50 border-gray-200";
            default: return "text-gray-700 bg-gray-50";
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
    }

    if (!order) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
                        <p className="text-gray-500 mt-1">Transaction details and manual overrides</p>
                    </div>
                </div>

                {/* Status Overrides */}
                <div className="flex gap-2">
                    {order.status !== "PAID" && (
                        <button
                            onClick={() => handleUpdateStatus("PAID")}
                            disabled={updating}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            Mark as PAID
                        </button>
                    )}
                    {order.status === "PENDING" && (
                        <button
                            onClick={() => handleUpdateStatus("FAILED")}
                            disabled={updating}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition-colors border border-red-200"
                        >
                            Mark as FAILED
                        </button>
                    )}
                </div>
            </div>

            <div className={`border rounded-xl p-6 flex items-center justify-between ${getStatusTextClasses(order.status)}`}>
                <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                        <h2 className="text-lg font-bold">Status: {order.status}</h2>
                        <p className="text-sm opacity-80">
                            {order.status === "PAID" ? `Paid on ${format(new Date(order.paidAt || order.updatedAt), "PPP p", { locale: localeId })}` : `Created on ${format(new Date(order.createdAt), "PPP p", { locale: localeId })}`}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">Total Amount</p>
                    <p className="text-3xl font-bold font-mono">
                        {order.amount === 0 ? "FREE" : `Rp ${order.amount.toLocaleString("id-ID")}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Customer Details</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Name</p>
                            <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="text-sm text-gray-900">{order.user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">User ID</p>
                            <p className="text-xs font-mono text-gray-500">{order.user.id}</p>
                        </div>
                    </div>
                </div>

                {/* Course Info */}
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Course Details</h3>
                    <div className="flex gap-4">
                        {order.course.thumbnailUrl && (
                            <img src={order.course.thumbnailUrl} alt={order.course.title} className="w-24 h-16 object-cover rounded-md border" />
                        )}
                        <div className="space-y-1">
                            <p className="font-medium text-gray-900 line-clamp-2">{order.course.title}</p>
                            <Link href={`/admin/courses/${order.course.id}`} className="text-xs text-blue-600 hover:underline inline-block mt-1">
                                View Course &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mayar Info */}
                <div className="bg-white border rounded-xl p-6 shadow-sm md:col-span-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Payment Gateway (Mayar)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Invoice ID</p>
                            <p className="text-sm font-mono text-gray-900">{order.mayarInvoiceId || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Payment Method</p>
                            <p className="text-sm text-gray-900">{order.paymentMethod || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Payment Channel</p>
                            <p className="text-sm text-gray-900 uppercase">{order.paymentChannel || "N/A"}</p>
                        </div>
                        {order.mayarInvoiceUrl && (
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Invoice Link</p>
                                <a href={order.mayarInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                    Open in Mayar &nearr;
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Webhook Logs */}
                <div className="bg-white border rounded-xl p-6 shadow-sm md:col-span-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                        Webhook Logs
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{order.webhookLogs?.length || 0} events</span>
                    </h3>

                    {order.webhookLogs && order.webhookLogs.length > 0 ? (
                        <div className="space-y-4">
                            {order.webhookLogs.map((log: any) => (
                                <div key={log.id} className="border rounded-lg p-4 bg-gray-50 text-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-semibold text-gray-900 border bg-white px-2 py-1 rounded shadow-sm text-xs mr-2">
                                                {log.event}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded inline-block ${log.httpStatus === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                HTTP {log.httpStatus}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {format(new Date(log.receivedAt), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                                        </div>
                                    </div>

                                    <details className="mt-3 cursor-pointer group">
                                        <summary className="text-xs font-medium text-blue-600 group-hover:underline">View Payload</summary>
                                        <pre className="mt-2 text-xs text-gray-600 bg-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto">
                                            {JSON.stringify(log.payload, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No webhook logs received for this order yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
