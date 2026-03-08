"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, Ban, RefreshCcw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Subscriber {
    id: string;
    userId: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    aiChatUsedThisMonth: number;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    plan: {
        id: string;
        name: string;
        tier: string;
        aiMentorQuota: number;
    }
}

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [tierFilter, setTierFilter] = useState("ALL");

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/subscribers");
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data);
            }
        } catch (error) {
            console.error("Failed to fetch subscribers", error);
            toast.error("Gagal memuat data subscriber");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleSuspend = async (subId: string) => {
        if (!confirm("Suspend (tangguhkan) akses user ini? Status akan menjadi EXPIRED.")) return;

        try {
            const res = await fetch(`/api/admin/subscribers/${subId}/suspend`, { method: "POST" });
            if (res.ok) {
                toast.success("Subscription berhasil ditangguhkan");
                fetchSubscribers();
            } else {
                toast.error("Gagal menangguhkan subscription");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan");
        }
    };

    const handleApprove = async (subId: string) => {
        if (!confirm("Approve manual (Acc) subscription ini? Status akan otomatis jadi AKTIF.")) return;

        try {
            const res = await fetch(`/api/admin/subscribers/${subId}/approve`, { method: "POST" });
            if (res.ok) {
                toast.success("Subscription berhasil di-Acc Manual");
                fetchSubscribers();
            } else {
                toast.error("Gagal Acc subscription");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan");
        }
    };

    // Filter Logic
    const filteredSubscribers = subscribers.filter(sub => {
        const matchesSearch =
            sub.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
        const matchesTier = tierFilter === "ALL" || sub.plan.tier === tierFilter;

        return matchesSearch && matchesStatus && matchesTier;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 uppercase"><CheckCircle2 className="w-3 h-3" /> Aktif</span>;
            case 'PAST_DUE':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 uppercase"><AlertCircle className="w-3 h-3" /> Menunggak</span>;
            case 'EXPIRED':
            case 'CANCELLED':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 uppercase"><Ban className="w-3 h-3" /> Berakhir</span>;
            case 'PENDING':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase"><RefreshCcw className="w-3 h-3" /> Menunggu Bayar</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">{status}</span>;
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Subscriber Aktif</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola data murid yang berlangganan kelas secara hybrid.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        <div className="flex bg-purple-50 items-center justify-center p-3 rounded-xl">
                            <Users className="w-5 h-5 text-purple-600 mr-3" />
                            <div>
                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wide">Total Subscriber</p>
                                <p className="text-xl font-black text-purple-700 leading-none">{subscribers.filter(s => s.status === 'ACTIVE').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-shadow"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#A855F7] min-w-[140px]"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="ACTIVE">Aktif (Bisa Akses)</option>
                            <option value="PAST_DUE">Menunggak</option>
                            <option value="PENDING">Belum Bayar</option>
                            <option value="EXPIRED">Berakhir/Suspend</option>
                        </select>
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#A855F7] min-w-[140px]"
                        >
                            <option value="ALL">Semua Tier</option>
                            <option value="BIASA">Tier Biasa</option>
                            <option value="MURID">Tier Murid</option>
                            <option value="PROFESIONAL">Tier Profesional</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[250px]">Student</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan & Tier</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Periode Aktif</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usage AI</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="w-6 h-6 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            Memuat data subscriber...
                                        </td>
                                    </tr>
                                ) : filteredSubscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mb-3">
                                                <Search className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-bold">Tidak ada subscriber ditemukan</p>
                                            <p className="text-gray-500 text-sm mt-1">Coba ubah filter pencarian Anda.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubscribers.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{sub.user.name || "User Tidak Bernama"}</p>
                                                <p className="text-xs text-gray-500">{sub.user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="font-semibold text-gray-900">{sub.plan.name}</span>
                                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded uppercase">Tier {sub.plan.tier}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(sub.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {sub.status !== 'PENDING' ? (
                                                    <div className="text-sm">
                                                        <p className="text-gray-900 font-medium">{format(new Date(sub.currentPeriodStart), 'dd MMM yyyy', { locale: id })} -</p>
                                                        <p className="text-gray-500 font-medium">{format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy', { locale: id })}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{
                                                                width: sub.plan.aiMentorQuota > 0
                                                                    ? `${Math.min(100, Math.round((sub.aiChatUsedThisMonth / sub.plan.aiMentorQuota) * 100))}%`
                                                                    : '0%'
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-600">
                                                        {sub.plan.aiMentorQuota > 0 ? `${sub.aiChatUsedThisMonth}/${sub.plan.aiMentorQuota}` : '0/0'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {sub.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleApprove(sub.id)}
                                                            className="text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                                        >
                                                            Acc Manual
                                                        </button>
                                                    )}
                                                    {sub.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => handleSuspend(sub.id)}
                                                            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                                        >
                                                            Suspend
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
                </div>

            </div>
        </>
    );
}
