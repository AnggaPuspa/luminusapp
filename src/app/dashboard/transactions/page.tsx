"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ExternalLink, ReceiptText, Mail, Bell, User, CheckCircle2, Clock, AlertCircle, FileText, MoreHorizontal, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import StudentTopbar from "@/components/dashboard/StudentTopbar";

interface TransactionItem {
    id: string;
    course: {
        title: string;
        thumbnailUrl: string | null;
    };
    createdAt: string;
    amount: number;
    status: string;
    mayarInvoiceUrl: string | null;
}

export default function StudentTransactionsPage() {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch("/api/student/transactions");
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data);
                }
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-100 text-green-700";
            case "PENDING": return "bg-orange-100 text-orange-700";
            case "FAILED":
            case "EXPIRED": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const totalTx = transactions.length;
    const paidTx = transactions.filter(t => t.status === 'PAID').length;
    const pendingTx = transactions.filter(t => t.status === 'PENDING').length;
    const failedTx = transactions.filter(t => ['FAILED', 'EXPIRED'].includes(t.status)).length;

    // Pagination Logic
    const totalPages = Math.ceil(totalTx / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalTx);
    const paginatedTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="flex w-full pb-10">
            <div className="flex-1 space-y-8 min-w-0 w-full xl:max-w-none">

                {/* Full-width Top header area */}
                <div className="flex items-start xl:items-center justify-between w-full gap-4">
                    <div className="flex-1 w-full max-w-full">
                        <StudentTopbar />
                    </div>
                    {/* Top Right Header Match Menu Height (Desktop Only, since topbar has its own mobile menu) */}
                    <div className="hidden xl:flex items-center justify-end gap-5 h-12 px-2 flex-shrink-0">
                        <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#696EFF] hover:border-[#696EFF] transition-colors bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <Mail className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#696EFF] hover:border-[#696EFF] transition-colors relative bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            <Bell className="w-4 h-4" />
                        </button>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-r from-[#696EFF] to-indigo-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-800 text-sm group-hover:text-[#696EFF] transition-colors">Pelajar</span>
                        </div>
                    </div>
                </div>

                <div>    <h1 className="text-[28px] font-extrabold text-[#111111] mb-6">Riwayat Transaksi</h1>

                    {/* Stat Cards Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Total Transaction */}
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-medium text-gray-400">Total Transaksi</p>
                                <div className="w-10 h-10 rounded-full bg-[#696EFF] flex items-center justify-center shadow-md shadow-[#696EFF]/20">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-1">{totalTx}</h3>
                            <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                                <span className="text-gray-400 font-medium">Berdasarkan seluruh data</span>
                            </p>
                        </div>

                        {/* Paid */}
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-medium text-gray-400">Pembayaran Berhasil</p>
                                <div className="w-10 h-10 rounded-full bg-[#38BDF8] flex items-center justify-center shadow-md shadow-[#38BDF8]/20">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-1">{paidTx}</h3>
                            <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                                <span className="text-gray-400 font-medium">Transaksi lunas</span>
                            </p>
                        </div>

                        {/* Pending */}
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-medium text-gray-400">Menunggu Pembayaran</p>
                                <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center shadow-md shadow-[#F59E0B]/20">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-1">{pendingTx}</h3>
                            <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                                <span className="text-gray-400 font-medium">Selesaikan pembayaran</span>
                            </p>
                        </div>

                        {/* Failed */}
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-medium text-gray-400">Dibatalkan/Gagal</p>
                                <div className="w-10 h-10 rounded-full bg-[#EF4444] flex items-center justify-center shadow-md shadow-[#EF4444]/20">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-1">{failedTx}</h3>
                            <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                                <span className="text-gray-400 font-medium">Melewati batas waktu</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-50 rounded-[32px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Latest Transactions</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="text-gray-900 font-bold border-b border-gray-100 pb-2">
                                    <th className="pb-4 font-bold px-2 w-10"></th>
                                    <th className="pb-4 font-bold px-4">Kelas</th>
                                    <th className="pb-4 font-bold px-4">Invoice ID</th>
                                    <th className="pb-4 font-bold px-4">Status</th>
                                    <th className="pb-4 font-bold px-4">Tanggal</th>
                                    <th className="pb-4 font-bold px-4">Harga</th>
                                    <th className="pb-4 font-bold px-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500">
                                            <div className="w-8 h-8 border-4 border-[#696EFF] border-t-transparent flex rounded-full animate-spin mx-auto mb-4"></div>
                                            Memuat data transaksi...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-500 bg-[#FAFAFA] rounded-2xl mt-4 block w-full">
                                            <ReceiptText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <p className="font-medium text-gray-500">Belum ada riwayat transaksi.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((tx) => (
                                        <tr key={tx.id} className="group hover:bg-[#FAFAFA]/50 transition-colors">
                                            <td className="py-5 px-2">
                                                <div className="w-5 h-5 rounded border-2 border-gray-200 flex items-center justify-center group-hover:border-[#696EFF] transition-colors ml-2"></div>
                                            </td>
                                            <td className="py-5 px-4 max-w-[250px]">
                                                <div className="flex items-center gap-4">
                                                    {tx.course.thumbnailUrl ? (
                                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                                                            <Image src={tx.course.thumbnailUrl} alt={tx.course.title} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                                            <ReceiptText className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-gray-900 truncate">{tx.course.title}</span>
                                                        <span className="text-xs font-medium text-gray-400 truncate">Sistem Pembelian Kelas</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="font-bold text-gray-800">
                                                    INV-{tx.id.split('-')[0].toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4">
                                                {tx.status === "PAID" && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#38BDF8] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                                    </span>
                                                )}
                                                {tx.status === "PENDING" && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                                {['FAILED', 'EXPIRED'].includes(tx.status) && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444] text-white text-[11px] font-bold rounded-full uppercase tracking-wide">
                                                        <AlertCircle className="w-3 h-3" /> Unpaid
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="text-xs font-bold text-gray-400 tracking-wide">
                                                    {format(new Date(tx.createdAt), "MMMM dd, yyyy", { locale: localeId })}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4 font-bold text-gray-900">
                                                {formatPrice(tx.amount)}
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <button className="text-gray-400 hover:text-[#696EFF] transition-colors p-2" title="Print Invoice">
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    {tx.mayarInvoiceUrl ? (
                                                        <a href={tx.mayarInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#38BDF8] transition-colors p-2" title="Lihat Detail Transaksi">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </a>
                                                    ) : (
                                                        <button className="text-gray-200 cursor-not-allowed p-2">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!loading && totalTx > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-100 mt-6 gap-4">
                            <div className="text-sm font-medium text-gray-400">
                                Showing <span className="text-gray-900 font-bold">{totalTx === 0 ? 0 : startIndex + 1}-{endIndex}</span> from <span className="text-gray-900 font-bold">{totalTx}</span> data
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-[#696EFF] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: totalPages }).map((_, index) => {
                                    const pageNum = index + 1;
                                    // Paginasi sederhana (tampilkan max 3 halaman pertama/terakhir atau sekitar active page kalau datanya banyak banget)
                                    // Untuk kasus MVP ini kita render semua (biasanya max 10 data)
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${currentPage === pageNum
                                                    ? "bg-[#696EFF] text-white shadow-lg shadow-[#696EFF]/30 scale-105"
                                                    : "bg-white text-gray-500 border-2 border-gray-200 hover:border-[#696EFF] hover:text-[#696EFF]"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-[#696EFF] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
