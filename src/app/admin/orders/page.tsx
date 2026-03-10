"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, TrendingUp, Search, Filter, Download } from "lucide-react";

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredOrders = orders.filter(o =>
        (o.mayarInvoiceId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.course?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

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
            case "PAID": return "bg-[#F0FDF4] text-[#22C55E]";
            case "PENDING": return "bg-[#FEF9C3] text-[#EAB308]";
            case "FAILED": return "bg-[#FEF2F2] text-[#EF4444]";
            case "EXPIRED": return "bg-gray-100 text-gray-500";
            default: return "bg-[#EEEDFA] text-[#4F46E5]";
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Top Overview Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Sales Overview Chart */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-7 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Sales Overview</h2>
                        <div className="flex gap-2">
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
                                <Calendar className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
                                <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-[34px] font-bold text-[#1a1a1a] leading-none">35%</h3>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#84C529]" strokeWidth={2.5} />
                                <span className="text-[13px] font-medium text-[#8e95a5]">Last month $56,443.00</span>
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#8e95a5]">December 2023</span>
                    </div>

                    {/* Dummy Bar Chart */}
                    <div className="h-[140px] flex items-end justify-between gap-1 overflow-hidden px-2">
                        {[
                            { h: 30, t: '06' }, { h: 50, t: '07' }, { h: 90, t: '08' }, { h: 40, t: '09' },
                            { h: 60, t: '10' }, { h: 55, t: '11' }, { h: 35, t: '12' }, { h: 45, t: '13' },
                            { h: 30, t: '14' }, { h: 65, t: '15' }, { h: 75, t: '16' }, { h: 95, t: '17' },
                            { h: 40, t: '18' }, { h: 80, t: '19' }, { h: 90, t: '20' }
                        ].map((bar, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 flex-1">
                                <div className="w-3 md:w-3.5 h-[100px] bg-gray-50 rounded-full relative overflow-hidden">
                                    <div
                                        className="absolute bottom-0 inset-x-0 bg-[#4F46E5] rounded-full transition-all duration-500 hover:opacity-80"
                                        style={{ height: `${bar.h}%` }}
                                    ></div>
                                </div>
                                <span className="text-[11px] font-medium text-[#8e95a5]">{bar.t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4 Small Cards */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Earnings</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">$12,234.99</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> +15%
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-45 shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Number of Sales</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">3,847</p>
                                <p className="text-[#ef4444] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> -5%
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 border-b-gray-100 rotate-[-15deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Product Views</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">312,234</p>
                                <p className="text-[#ef4444] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> -2%
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-l-gray-100 border-r-gray-100 border-t-gray-100 rotate-[40deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Completed Orders</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">10,847</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> +7%
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-b-gray-100 rotate-[20deg] shrink-0"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Data Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <h2 className="text-[17px] font-bold text-[#1a1a1a]">Recent Orders</h2>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors w-64 hover:bg-gray-100"
                            />
                        </div>
                        <button className="p-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><Filter className="w-[18px] h-[18px]" strokeWidth={2} /></button>
                        <button className="p-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><Download className="w-[18px] h-[18px]" strokeWidth={2} /></button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-4 font-normal w-[16%]">Mayar Invoice ID</th>
                                <th className="px-4 py-4 font-normal w-[20%]">Customer</th>
                                <th className="px-4 py-4 font-normal w-[24%]">Course</th>
                                <th className="px-4 py-4 font-normal w-[14%]">Date</th>
                                <th className="px-4 py-4 font-normal w-[12%]">Amount</th>
                                <th className="px-4 py-4 font-normal w-[10%]">Status</th>
                                <th className="px-4 py-4 w-[4%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-[13px] font-medium">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-[13px] font-medium">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                        className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 cursor-pointer"
                                    >
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden">
                                                <span className="text-gray-500 font-medium text-[13px] truncate block w-full group-hover:text-[#4F46E5] transition-colors">
                                                    {order.mayarInvoiceId || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden">
                                                <div className="min-w-0 w-full">
                                                    <div className="font-semibold text-[#1a1a1a] text-[13.5px] leading-tight truncate">{order.user?.name}</div>
                                                    <div className="text-[12px] text-[#8e95a5] mt-0.5 leading-tight truncate" title={order.user?.email}>{order.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden">
                                                <span className="font-semibold text-[#1a1a1a] text-[13px] truncate block w-full">{order.course?.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden">
                                                <div className="min-w-0 w-full">
                                                    <span className="text-[13px] font-semibold text-[#1a1a1a] truncate block">{format(new Date(order.createdAt), "dd MMM yyyy", { locale: id })}</span>
                                                    <span className="text-[12px] text-[#8e95a5] font-medium truncate block mt-0.5">{format(new Date(order.createdAt), "HH:mm", { locale: id })}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 font-semibold text-[#1a1a1a] text-[13.5px] whitespace-nowrap overflow-hidden">
                                                <span className="truncate block w-full">{order.amount === 0 ? "Free" : `Rp ${order.amount.toLocaleString("id-ID")}`}</span>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold ${getStatusBadgeColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-1 justify-end pr-5">
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors hover:bg-gray-100 flex-shrink-0">
                                                    <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={2} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-5 px-6 pt-4 flex items-center justify-between text-[13px] text-gray-500 border-t border-gray-50">
                    <p>Showing <span className="font-semibold text-[#1a1a1a]">{totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, totalItems)}</span> from <span className="font-semibold text-[#1a1a1a]">{totalItems}</span> data</p>
                    <div className="flex gap-1 items-center">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >&lt;</button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Simple logic to show window of 5 pages around current
                            let pageNum = currentPage;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md font-medium transition-colors ${currentPage === pageNum
                                        ? "bg-[#4F46E5] text-white shadow-sm font-semibold"
                                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
