"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/admin/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-100 text-green-700";
            case "PENDING": return "bg-amber-100 text-amber-700";
            case "FAILED": return "bg-red-100 text-red-700";
            case "EXPIRED": return "bg-gray-100 text-gray-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders & Transactions</h1>
                    <p className="text-gray-500 mt-1">Monitor course purchases and Mayar integration statuses.</p>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Mayar Invoice ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Course</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                                            {order.mayarInvoiceId || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{order.user?.name}</div>
                                            <div className="text-xs text-gray-500">{order.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.course?.title}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {order.amount === 0 ? "Free" : `Rp ${order.amount.toLocaleString("id-ID")}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-between">
                                                <span>{format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: id })}</span>
                                                <span className="text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-4 whitespace-nowrap">
                                                    View Details &rarr;
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
