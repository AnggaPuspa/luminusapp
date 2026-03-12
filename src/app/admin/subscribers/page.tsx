"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, Ban, RefreshCcw, CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, TrendingUp, Download } from "lucide-react";
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

    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Date Picker state
    const [selectedMonth, setSelectedMonth] = useState<number | "all">(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [tierFilter, setTierFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await fetch(`/api/admin/subscribers/stats?month=${selectedMonth}&year=${selectedYear}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch subscriber stats", error);
        } finally {
            setStatsLoading(false);
        }
    };

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

    useEffect(() => {
        fetchStats();
    }, [selectedMonth, selectedYear]);

    const handleSuspend = async (subId: string) => {
        if (!confirm("Suspend (tangguhkan) akses user ini? Status akan menjadi EXPIRED.")) return;

        try {
            const res = await fetch(`/api/admin/subscribers/${subId}/suspend`, { method: "POST" });
            if (res.ok) {
                toast.success("Subscription berhasil ditangguhkan");
                fetchSubscribers();
                fetchStats();
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
                fetchStats();
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

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, tierFilter]);

    const totalItems = filteredSubscribers.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedSubscribers = filteredSubscribers.slice(startIndex, startIndex + pageSize);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#F0FDF4] text-[#22C55E]`}>Aktif</span>;
            case 'PAST_DUE':
                return <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#FEF9C3] text-[#EAB308]`}>Menunggak</span>;
            case 'EXPIRED':
            case 'CANCELLED':
                return <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#FEF2F2] text-[#EF4444]`}>Berakhir</span>;
            case 'PENDING':
                return <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-gray-100 text-gray-500`}>Belum Bayar</span>;
            default:
                return <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#EEEDFA] text-[#4F46E5]`}>{status}</span>;
        }
    };

    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const calcChange = (current: number, prev: number) => {
        if (prev === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
        const change = ((current - prev) / prev) * 100;
        return { value: Math.round(change * 10) / 10, isPositive: change >= 0 };
    };

    const activeChange = stats ? calcChange(stats.stats.totalActive, stats.stats.prevActiveApprox) : { value: 0, isPositive: true };
    const signupsChange = stats ? calcChange(stats.stats.newSignups, stats.stats.prevSignups) : { value: 0, isPositive: true };
    const churnRateDiff = stats ? Math.round((stats.stats.churnRate - stats.stats.prevChurnRate) * 100) / 100 : 0;
    const aiChatsChange = stats ? calcChange(stats.stats.totalAiChats, stats.stats.prevAiChats) : { value: 0, isPositive: true };

    const maxChartValue = stats ? Math.max(...stats.dailyChart.map((d: any) => d.count), 1) : 1;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Top Overview Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Subscribers Overview Chart */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-7 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Subscriptions Overview</h2>
                        <div className="flex gap-2 relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`p-2 border rounded-lg transition-colors cursor-pointer ${showDatePicker ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                <Calendar className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                            
                            {/* Date Picker Popover */}
                            {showDatePicker && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowDatePicker(false)} />
                                    <div className="absolute top-full right-0 mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-[280px]">
                                        <div className="flex justify-between items-center mb-4">
                                            <button 
                                                onClick={() => setSelectedYear(prev => prev - 1)}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                            >&lt;</button>
                                            <span className="font-semibold text-[15px]">{selectedYear}</span>
                                            <button 
                                                onClick={() => setSelectedYear(prev => prev + 1)}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                            >&gt;</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedMonth("all");
                                                    setShowDatePicker(false);
                                                }}
                                                className={`py-2 text-[13px] col-span-3 rounded-lg transition-colors ${
                                                    selectedMonth === "all"
                                                        ? "bg-[#4F46E5] text-white font-medium shadow-sm"
                                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                Entire Year ({selectedYear})
                                            </button>
                                            {MONTH_NAMES.map((m, i) => (
                                                <button
                                                    key={m}
                                                    onClick={() => {
                                                        setSelectedMonth(i);
                                                        setShowDatePicker(false);
                                                    }}
                                                    className={`py-2 text-[13px] rounded-lg transition-colors ${
                                                        selectedMonth === i
                                                            ? "bg-[#4F46E5] text-white font-medium shadow-sm"
                                                            : "text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {m.substring(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
                                <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-[34px] font-bold text-[#1a1a1a] leading-none">
                                {statsLoading ? "..." : (signupsChange.isPositive ? "+" : "") + signupsChange.value + "%"}
                            </h3>
                            {!statsLoading && (
                                <div className="flex items-center gap-2">
                                    {signupsChange.isPositive ? (
                                        <TrendingUp className="w-5 h-5 text-[#84C529]" strokeWidth={2.5} />
                                    ) : (
                                        <TrendingUp className="w-5 h-5 text-red-500 scale-y-[-1]" strokeWidth={2.5} />
                                    )}
                                    <span className="text-[13px] font-medium text-[#8e95a5]">Growth rate M-o-M</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[13px] font-medium text-[#4F46E5] bg-[#EEEDFA] px-3 py-1 rounded-full">
                            {selectedMonth === "all" ? `Entire Year ${selectedYear}` : `${MONTH_NAMES[selectedMonth as number]} ${selectedYear}`}
                        </span>
                    </div>

                    {/* Dynamic Bar Chart */}
                    <div className="h-[140px] flex items-end justify-between gap-1 overflow-hidden px-2">
                        {statsLoading ? (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Loading chart...</div>
                        ) : stats?.dailyChart.map((bar: any, i: number) => {
                            // Hitung tinggi dalam persentase, min 4% biar kelihatan buletannya
                            const heightPercent = Math.max((bar.count / maxChartValue) * 100, 4);
                            return (
                                <div key={i} className="flex flex-col items-center gap-3 flex-1 group" title={`${bar.count} signups`}>
                                    <div className={`${selectedMonth === "all" ? "w-4 md:w-6" : "w-2.5 md:w-3.5"} h-[100px] bg-gray-50 rounded-full relative overflow-hidden transition-all delay-75`}>
                                        <div
                                            className="absolute bottom-0 inset-x-0 bg-[#4F46E5] rounded-full transition-all duration-500 group-hover:bg-[#4338CA] group-hover:shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                            style={{ height: `${bar.count === 0 ? 0 : heightPercent}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-[11px] font-medium ${selectedMonth === "all" || bar.day % 2 !== 0 ? 'text-[#8e95a5]' : 'text-transparent'}`}>
                                        {selectedMonth === "all" ? MONTH_NAMES[bar.day - 1]?.substring(0, 3) : bar.day.toString().padStart(2, '0')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4 Small Cards */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {/* Card 1: Total Subscribers */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Subscribers</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">
                                    {statsLoading ? "..." : stats?.stats.totalActive.toLocaleString('id-ID')}
                                </p>
                                {!statsLoading && (
                                    <p className={`${activeChange.isPositive ? 'text-[#84C529]' : 'text-[#ef4444]'} font-medium text-[12px] flex items-center mt-1`}>
                                        {activeChange.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                        {activeChange.isPositive ? '+' : ''}{activeChange.value}%
                                    </p>
                                )}
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-[60deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 2: New Signups */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">New Signups</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">
                                    {statsLoading ? "..." : stats?.stats.newSignups.toLocaleString('id-ID')}
                                </p>
                                {!statsLoading && (
                                    <p className={`${signupsChange.isPositive ? 'text-[#84C529]' : 'text-[#ef4444]'} font-medium text-[12px] flex items-center mt-1`}>
                                        {signupsChange.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                        {signupsChange.isPositive ? '+' : ''}{signupsChange.value}%
                                    </p>
                                )}
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 border-b-gray-100 rotate-[10deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 3: Churn Rate */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Churn Rate</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">
                                    {statsLoading ? "..." : `${stats?.stats.churnRate}%`}
                                </p>
                                {!statsLoading && (
                                    <p className={`${churnRateDiff <= 0 ? 'text-[#84C529]' : 'text-[#ef4444]'} font-medium text-[12px] flex items-center mt-1`}>
                                        {churnRateDiff <= 0 ? <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                        {churnRateDiff > 0 ? '+' : ''}{churnRateDiff}%
                                    </p>
                                )}
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-l-gray-100 border-r-gray-100 border-t-gray-100 rotate-[40deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 4: AI Chats Synced */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">AI Chats Synced</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">
                                    {statsLoading ? "..." : stats?.stats.totalAiChats.toLocaleString('id-ID')}
                                </p>
                                {!statsLoading && (
                                    <p className={`${aiChatsChange.isPositive ? 'text-[#84C529]' : 'text-[#ef4444]'} font-medium text-[12px] flex items-center mt-1`}>
                                        {aiChatsChange.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                        {aiChatsChange.isPositive ? '+' : ''}{aiChatsChange.value}%
                                    </p>
                                )}
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-b-gray-100 rotate-[90deg] shrink-0"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscribers Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-transparent overflow-hidden">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <h2 className="text-[17px] font-bold text-[#1a1a1a]">Recent Subscribers</h2>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search subscribers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors w-64 hover:bg-gray-100"
                            />
                        </div>

                        {/* Dropdowns mapped to new UI style */}
                        <div className="relative hidden lg:block">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors cursor-pointer hover:bg-gray-100 text-gray-600"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PAST_DUE">Past Due</option>
                                <option value="PENDING">Pending</option>
                                <option value="EXPIRED">Expired</option>
                            </select>
                            <Filter className="w-[14px] h-[14px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        <button className="p-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><Download className="w-[18px] h-[18px]" strokeWidth={2} /></button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-4 font-normal w-[20%]">Student</th>
                                <th className="px-4 py-4 font-normal w-[22%]">Plan & Tier</th>
                                <th className="px-4 py-4 font-normal w-[11%]">Status</th>
                                <th className="px-4 py-4 font-normal w-[16%]">Active Period</th>
                                <th className="px-4 py-4 font-normal w-[14%]">Usage AI</th>
                                <th className="px-4 py-4 font-normal w-[17%]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-[13px] font-medium">
                                        Loading subscribers...
                                    </td>
                                </tr>
                            ) : paginatedSubscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-[13px] font-medium">
                                        No subscribers found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedSubscribers.map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden">
                                                <div className="min-w-0 w-full">
                                                    <div className="font-semibold text-[#1a1a1a] text-[13.5px] leading-tight truncate">{sub.user.name || "Unknown User"}</div>
                                                    <div className="text-[12px] text-[#8e95a5] mt-0.5 leading-tight truncate" title={sub.user.email}>{sub.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex flex-col justify-center px-4 overflow-hidden">
                                                <span className="font-semibold text-[#1a1a1a] text-[13px] truncate block w-full">{sub.plan.name}</span>
                                                <span className="text-[11px] text-[#4F46E5] font-semibold mt-0.5 truncate block w-full uppercase">Tier {sub.plan.tier}</span>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                {getStatusBadge(sub.status)}
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex flex-col justify-center px-4 overflow-hidden">
                                                {sub.status !== 'PENDING' ? (
                                                    <>
                                                        <span className="font-medium text-[#1a1a1a] text-[12.5px] truncate block w-full">{format(new Date(sub.currentPeriodStart), 'dd MMM yyyy', { locale: id })} -</span>
                                                        <span className="text-[11.5px] text-[#8e95a5] font-medium truncate block w-full">{format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy', { locale: id })}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[12.5px] text-[#8e95a5] font-medium truncate block w-full">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden gap-2">
                                                <div className="w-12 sm:w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                                    <div
                                                        className="h-full bg-[#4F46E5] rounded-full"
                                                        style={{
                                                            width: sub.plan.aiMentorQuota > 0
                                                                ? `${Math.min(100, Math.round((sub.aiChatUsedThisMonth / sub.plan.aiMentorQuota) * 100))}%`
                                                                : '0%'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[12px] font-semibold text-[#8e95a5] shrink-0">
                                                    {sub.plan.aiMentorQuota > 0 ? `${sub.aiChatUsedThisMonth}/${sub.plan.aiMentorQuota}` : '0/0'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 justify-start gap-1.5">
                                                {sub.status === 'PENDING' && (
                                                    <button onClick={() => handleApprove(sub.id)} className="text-[11px] font-bold text-[#22C55E] bg-[#F0FDF4] hover:bg-green-100 px-2 py-1.5 rounded transition-colors whitespace-nowrap">
                                                        Approve
                                                    </button>
                                                )}
                                                {sub.status === 'ACTIVE' && (
                                                    <button onClick={() => handleSuspend(sub.id)} className="text-[11px] font-bold text-[#EF4444] bg-[#FEF2F2] hover:bg-red-100 px-2 py-1.5 rounded transition-colors whitespace-nowrap">
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
