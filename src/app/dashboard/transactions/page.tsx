"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ExternalLink, ReceiptText } from "lucide-react";

export default function StudentTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
                <p className="text-gray-500 mt-1">Daftar semua pembelian kelasmu.</p>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Kelas</th>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">Harga</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <ReceiptText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>Belum ada riwayat transaksi.</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {tx.course.thumbnailUrl && (
                                                    <div className="w-12 h-10 relative rounded overflow-hidden">
                                                        <Image
                                                            src={tx.course.thumbnailUrl}
                                                            alt={tx.course.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900 line-clamp-2 max-w-[200px]">
                                                    {tx.course.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {format(new Date(tx.createdAt), "dd MMM yyyy", { locale: id })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {formatPrice(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.status === "PENDING" && tx.mayarInvoiceUrl ? (
                                                <a
                                                    href={tx.mayarInvoiceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#696EFF] text-white text-xs font-medium rounded hover:bg-blue-700 transition"
                                                >
                                                    Bayar Sekarang <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : tx.mayarInvoiceUrl ? (
                                                <a
                                                    href={tx.mayarInvoiceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition"
                                                >
                                                    Lihat Invoice <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
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
