"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Webhook, CheckCircle2, XCircle, ArrowUpRight, MoreHorizontal, Search, Filter, X, TrendingUp, RefreshCw } from "lucide-react";

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayload, setSelectedPayload] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/webhooks");
            if (res.ok) {
                const data = await res.json();
                setWebhooks(data);
            }
        } catch (error) {
            console.error("Failed to fetch webhooks", error);
        } finally {
            setLoading(false);
        }
    };

    const totalSuccess = webhooks.filter(w => w.httpStatus >= 200 && w.httpStatus < 300).length;
    const totalFailed = webhooks.filter(w => w.httpStatus < 200 || w.httpStatus >= 300).length;
    const uniqueEvents = new Set(webhooks.map(w => w.event)).size;

    const filteredWebhooks = webhooks.filter(w => {
        const matchSearch = (w.event || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (w.transactionId || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "ALL" ||
            (statusFilter === "SUCCESS" ? (w.httpStatus >= 200 && w.httpStatus < 300) : !(w.httpStatus >= 200 && w.httpStatus < 300));
        return matchSearch && matchStatus;
    });

    const totalItems = filteredWebhooks.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedWebhooks = filteredWebhooks.slice(startIndex, startIndex + pageSize);

    const isSuccess = (status: number) => status >= 200 && status < 300;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* Top: 4 Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Logs</p>
                            <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : webhooks.length}</p>
                            <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> 100 terbaru
                            </p>
                        </div>
                        <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-45 shrink-0"></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Sukses</p>
                            <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : totalSuccess}</p>
                            <p className="text-[#22C55E] font-medium text-[12px] flex items-center mt-1">
                                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> 2xx status
                            </p>
                        </div>
                        <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#22C55E] border-r-gray-100 border-b-gray-100 rotate-[-15deg] shrink-0"></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Gagal</p>
                            <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : totalFailed}</p>
                            <p className="text-[#EF4444] font-medium text-[12px] flex items-center mt-1">
                                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Error status
                            </p>
                        </div>
                        <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#EF4444] border-l-gray-100 border-t-gray-100 rotate-[40deg] shrink-0"></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Jenis Event</p>
                            <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : uniqueEvents}</p>
                            <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Event unik
                            </p>
                        </div>
                        <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-b-gray-100 rotate-[90deg] shrink-0"></div>
                    </div>
                </div>
            </div>

            {/* Bottom: Webhook Logs Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Webhook Logs</h2>
                        <p className="text-[13px] text-[#8e95a5] font-medium mt-0.5">Event integration dari Mayar API (100 terbaru)</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari event atau transaction ID..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors w-64 hover:bg-gray-100"
                            />
                        </div>
                        <div className="relative hidden sm:block">
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors cursor-pointer hover:bg-gray-100 text-gray-600"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="SUCCESS">Sukses</option>
                                <option value="FAILED">Gagal</option>
                            </select>
                            <Filter className="w-[14px] h-[14px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={fetchWebhooks}
                            className="p-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-4 font-normal w-[28%]">Tipe Event</th>
                                <th className="px-4 py-4 font-normal w-[10%]">HTTP</th>
                                <th className="px-4 py-4 font-normal w-[28%]">Ref. Transaksi</th>
                                <th className="px-4 py-4 font-normal w-[22%]">Waktu Diterima</th>
                                <th className="px-4 py-4 font-normal w-[12%] text-right">Payload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#8e95a5] font-medium">
                                        Memuat webhook logs...
                                    </td>
                                </tr>
                            ) : paginatedWebhooks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Webhook className="w-8 h-8 text-gray-300" />
                                            <p className="text-[13px] font-semibold text-[#1a1a1a]">
                                                {searchTerm || statusFilter !== "ALL" ? "Tidak ada log ditemukan" : "Belum ada webhook log"}
                                            </p>
                                            <p className="text-[12px] text-[#8e95a5] font-medium">
                                                {searchTerm || statusFilter !== "ALL" ? "Coba ubah filter" : "Log akan muncul saat ada transaksi Mayar"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedWebhooks.map((log) => (
                                    <tr key={log.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                        {/* Event */}
                                        <td className="p-0">
                                            <div className="h-[56px] flex items-center px-4 overflow-hidden">
                                                <span className="text-[13px] font-semibold text-[#1a1a1a] font-mono truncate block w-full">{log.event}</span>
                                            </div>
                                        </td>
                                        {/* HTTP Status */}
                                        <td className="p-0">
                                            <div className="h-[56px] flex items-center px-4">
                                                {isSuccess(log.httpStatus) ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#F0FDF4] text-[#22C55E]">
                                                        <CheckCircle2 className="w-3 h-3" /> {log.httpStatus}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#FEF2F2] text-[#EF4444]">
                                                        <XCircle className="w-3 h-3" /> {log.httpStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Transaction Ref */}
                                        <td className="p-0">
                                            <div className="h-[56px] flex items-center px-4 overflow-hidden">
                                                <span className="text-[12px] font-mono text-[#8e95a5] truncate block w-full" title={log.transactionId || ""}>
                                                    {log.transactionId || "—"}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Time */}
                                        <td className="p-0">
                                            <div className="h-[56px] flex flex-col justify-center px-4 overflow-hidden">
                                                <span className="text-[13px] font-semibold text-[#1a1a1a] truncate block">
                                                    {format(new Date(log.receivedAt), "dd MMM yyyy", { locale: id })}
                                                </span>
                                                <span className="text-[12px] text-[#8e95a5] font-medium mt-0.5">
                                                    {format(new Date(log.receivedAt), "HH:mm:ss", { locale: id })}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Payload */}
                                        <td className="p-0">
                                            <div className="h-[56px] flex items-center justify-end px-4">
                                                <button
                                                    onClick={() => setSelectedPayload(log.payload)}
                                                    className="text-[12px] font-semibold text-[#4F46E5] bg-[#EEEDFA] hover:bg-[#E0DEFB] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    Lihat JSON
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
                    <p>Menampilkan <span className="font-semibold text-[#1a1a1a]">{totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, totalItems)}</span> dari <span className="font-semibold text-[#1a1a1a]">{totalItems}</span> data</p>
                    <div className="flex gap-1 items-center">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >&lt;</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = currentPage;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                                <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md font-medium transition-colors ${currentPage === pageNum ? "bg-[#4F46E5] text-white shadow-sm font-semibold" : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"}`}>
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

            {/* Custom JSON Payload Modal */}
            {selectedPayload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-[17px] font-bold text-[#1a1a1a]">Webhook Payload</h2>
                            <button
                                onClick={() => setSelectedPayload(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <div className="bg-[#0f172a] rounded-xl p-5 overflow-auto">
                                <pre className="text-[12.5px] font-mono text-[#4ade80] leading-relaxed">
                                    {JSON.stringify(selectedPayload, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedPayload(null)}
                                className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
