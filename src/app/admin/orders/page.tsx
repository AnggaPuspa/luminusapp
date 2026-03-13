"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, TrendingUp, Search, Filter, Download } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, YAxis } from "recharts";
import OrderDetailDrawer from "@/components/admin/OrderDetailDrawer";

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-xl">
                {payload[0].value} penjualan
            </div>
        );
    }
    return null;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const pageSize = 10;

    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Date Picker state
    const [selectedMonth, setSelectedMonth] = useState<number | "all">(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/stats?month=${selectedMonth}&year=${selectedYear}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch order stats", error);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const calcChange = (current: number, prev: number) => {
        if (prev === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
        const change = ((current - prev) / prev) * 100;
        return { value: Math.round(change * 10) / 10, isPositive: change >= 0 };
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.mayarInvoiceId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.course?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
        
        let matchesDate = true;
        const orderDate = new Date(o.createdAt);
        if (selectedMonth === "all") {
            matchesDate = orderDate.getFullYear() === selectedYear;
        } else {
            matchesDate = orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "PAID": return "bg-[#F0FDF4] text-[#22C55E]";
            case "PENDING": return "bg-[#FEF9C3] text-[#EAB308]";
            case "FAILED": return "bg-[#FEF2F2] text-[#EF4444]";
            case "EXPIRED": return "bg-gray-100 text-gray-500";
            default: return "bg-[#EEEDFA] text-[#4F46E5]";
        }
    };

    const MONTH_NAMES = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const handleExportCSV = () => {
        if (filteredOrders.length === 0) return alert("Hanya ada data kosong!");
        
        const headers = ["Mayar Invoice ID", "Nama Pelanggan", "Email", "Kursus", "Tanggal", "Jumlah (Rp)", "Status"];
        const csvContent = [
            headers.join(","),
            ...filteredOrders.map(o => [
                o.mayarInvoiceId || "-",
                `"${o.user?.name || "-"}"`,
                o.user?.email || "-",
                `"${o.course?.title || "-"}"`,
                `"${format(new Date(o.createdAt), "dd MMM yyyy - HH:mm", { locale: id })}"`,
                o.amount || 0,
                o.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Data_Pesanan_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const earningsChange = stats ? calcChange(stats.stats.totalEarnings, stats.stats.prevEarnings) : { value: 0, isPositive: true };
    const salesChange = stats ? calcChange(stats.stats.totalSales, stats.stats.prevSales) : { value: 0, isPositive: true };
    const ordersChange = stats ? calcChange(stats.stats.totalOrders, stats.stats.prevTotalOrders) : { value: 0, isPositive: true };
    const completedChange = stats ? calcChange(stats.stats.completedOrders, stats.stats.prevCompleted) : { value: 0, isPositive: true };

    const sparklineData = (() => {
        if (!stats?.dailyChart) return [];
        const now = new Date();
        if (selectedMonth === "all") {
            if (selectedYear === now.getFullYear()) {
                return stats.dailyChart.filter((d: any) => d.day <= now.getMonth() + 1);
            }
        } else {
            if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth()) {
                return stats.dailyChart.filter((d: any) => d.day <= now.getDate());
            }
        }
        return stats.dailyChart;
    })();

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Top Overview Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Sales Overview Chart */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-7 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Ringkasan Penjualan</h2>
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
                                                className={`py-2 text-[13px] col-span-3 rounded-lg transition-colors ${selectedMonth === "all"
                                                    ? "bg-[#4F46E5] text-white font-medium shadow-sm"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                Sepanjang Tahun ({selectedYear})
                                            </button>
                                            {MONTH_NAMES.map((m, i) => (
                                                <button
                                                    key={m}
                                                    onClick={() => {
                                                        setSelectedMonth(i);
                                                        setShowDatePicker(false);
                                                    }}
                                                    className={`py-2 text-[13px] rounded-lg transition-colors ${selectedMonth === i
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
                                {statsLoading ? "..." : (earningsChange.isPositive ? "+" : "") + earningsChange.value + "%"}
                            </h3>
                            {!statsLoading && (
                                <div className="flex items-center gap-2">
                                    {earningsChange.isPositive ? (
                                        <TrendingUp className="w-5 h-5 text-[#84C529]" strokeWidth={2.5} />
                                    ) : (
                                        <TrendingUp className="w-5 h-5 text-red-500 scale-y-[-1]" strokeWidth={2.5} />
                                    )}
                                    <span className="text-[13px] font-medium text-[#8e95a5]">
                                        {selectedMonth === "all" ? "Tahun" : "Bulan"} lalu Rp {stats?.stats.prevEarnings.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className="text-[13px] font-medium text-[#4F46E5] bg-[#EEEDFA] px-3 py-1 rounded-full">
                            {selectedMonth === "all" ? `Sepanjang Tahun ${selectedYear}` : `${MONTH_NAMES[selectedMonth as number]} ${selectedYear}`}
                        </span>
                    </div>

                    {/* Dynamic Bar Chart */}
                    <div className="h-[140px] overflow-hidden px-2 mt-4">
                        {statsLoading ? (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Memuat grafik...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats?.dailyChart?.map((d: any) => ({
                                        ...d,
                                        name: selectedMonth === "all" ? MONTH_NAMES[d.day - 1]?.substring(0, 3) : d.day.toString().padStart(2, '0')
                                    })) || []}
                                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                                >
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: '#f3f4f6', radius: 8 }}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#8e95a5', fontSize: 11, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={0}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide
                                        domain={[0, (dataMax: number) => Math.max(dataMax, 4)]}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#4F46E5"
                                        radius={[50, 50, 50, 50]}
                                        maxBarSize={selectedMonth === "all" ? 24 : 14}
                                        activeBar={{ fill: '#4338CA' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 4 Small Cards */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {/* Card 1: Earnings */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Pendapatan</p>
                                <p className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a]">
                                    {statsLoading ? "..." : `Rp ${stats?.stats.totalEarnings.toLocaleString('id-ID')}`}
                                </p>
                            </div>
                            {!statsLoading && (
                                <span className={`${earningsChange.isPositive ? 'text-[#84C529] bg-[#84C529]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] px-2 py-1 rounded-md flex items-center`}>
                                    {earningsChange.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                    {earningsChange.isPositive ? '+' : ''}{earningsChange.value}%
                                </span>
                            )}
                        </div>
                        <div className="h-[45px] w-full mt-auto -mx-1">
                            {!statsLoading && sparklineData.length > 0 ? (
                                (() => {
                                    const color = earningsChange.isPositive ? '#84C529' : '#ef4444';
                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Tooltip cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }} content={() => null} />
                                                <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarn)" isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    );
                                })()
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-md animate-pulse"></div>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Number of Sales */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Jumlah Penjualan</p>
                                <p className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a]">
                                    {statsLoading ? "..." : stats?.stats.totalSales.toLocaleString('id-ID')}
                                </p>
                            </div>
                            {!statsLoading && (
                                <span className={`${salesChange.isPositive ? 'text-[#4F46E5] bg-[#4F46E5]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] px-2 py-1 rounded-md flex items-center`}>
                                    {salesChange.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                    {salesChange.isPositive ? '+' : ''}{salesChange.value}%
                                </span>
                            )}
                        </div>
                        <div className="h-[45px] w-full mt-auto -mx-1">
                            {!statsLoading && sparklineData.length > 0 ? (
                                (() => {
                                    const color = salesChange.isPositive ? '#4F46E5' : '#ef4444';
                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Tooltip cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }} content={() => null} />
                                                <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    );
                                })()
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-md animate-pulse"></div>
                            )}
                        </div>
                    </div>

                    {/* Card 3: Total Orders */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Pesanan</p>
                                <p className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a]">
                                    {statsLoading ? "..." : stats?.stats.totalOrders.toLocaleString('id-ID')}
                                </p>
                            </div>
                            {!statsLoading && (
                                <span className={`${ordersChange.isPositive ? 'text-[#0ea5e9] bg-[#0ea5e9]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] px-2 py-1 rounded-md flex items-center`}>
                                    {ordersChange.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                    {ordersChange.isPositive ? '+' : ''}{ordersChange.value}%
                                </span>
                            )}
                        </div>
                        <div className="h-[45px] w-full mt-auto -mx-1">
                            {!statsLoading && sparklineData.length > 0 ? (
                                (() => {
                                    const color = ordersChange.isPositive ? '#0ea5e9' : '#ef4444';
                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Tooltip cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }} content={() => null} />
                                                <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    );
                                })()
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-md animate-pulse"></div>
                            )}
                        </div>
                    </div>

                    {/* Card 4: Completed Orders */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Selesai</p>
                                <p className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a]">
                                    {statsLoading ? "..." : stats?.stats.completedOrders.toLocaleString('id-ID')}
                                </p>
                            </div>
                            {!statsLoading && (
                                <span className={`${completedChange.isPositive ? 'text-[#10b981] bg-[#10b981]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] px-2 py-1 rounded-md flex items-center`}>
                                    {completedChange.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
                                    {completedChange.isPositive ? '+' : ''}{completedChange.value}%
                                </span>
                            )}
                        </div>
                        <div className="h-[45px] w-full mt-auto -mx-1">
                            {!statsLoading && sparklineData.length > 0 ? (
                                (() => {
                                    const color = completedChange.isPositive ? '#10b981' : '#ef4444';
                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Tooltip cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }} content={() => null} />
                                                <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    );
                                })()
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-md animate-pulse"></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Data Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <h2 className="text-[17px] font-bold text-[#1a1a1a]">Pesanan Terbaru</h2>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pesanan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors w-64 hover:bg-gray-100"
                            />
                        </div>
                        <div className="relative hidden sm:block">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors cursor-pointer hover:bg-gray-100 text-gray-600"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Lunas (Paid)</option>
                                <option value="FAILED">Gagal (Failed)</option>
                                <option value="EXPIRED">Kedaluwarsa (Expired)</option>
                            </select>
                            <Filter className="w-[14px] h-[14px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <button 
                            onClick={handleExportCSV}
                            title="Unduh CSV"
                            className="p-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <Download className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-4 font-normal w-[16%]">Mayar Invoice ID</th>
                                <th className="px-4 py-4 font-normal w-[20%]">Pelanggan</th>
                                <th className="px-4 py-4 font-normal w-[24%]">Kursus</th>
                                <th className="px-4 py-4 font-normal w-[14%]">Tanggal</th>
                                <th className="px-4 py-4 font-normal w-[12%]">Jumlah</th>
                                <th className="px-4 py-4 font-normal w-[10%]">Status</th>
                                <th className="px-4 py-4 w-[4%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td className="p-0">
                                            <div className="h-[64px] px-4 flex items-center">
                                                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] px-4 flex flex-col justify-center gap-2">
                                                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse"></div>
                                                <div className="h-3 w-40 bg-gray-50 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] px-4 flex items-center">
                                                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] px-4 flex flex-col justify-center gap-2">
                                                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                                                <div className="h-3 w-12 bg-gray-50 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] px-4 flex items-center">
                                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-0">
                                            <div className="h-[64px] px-4 flex items-center">
                                                <div className="h-6 w-16 bg-gray-100 rounded-md animate-pulse"></div>
                                            </div>
                                        </td>
                                        <td className="p-0"></td>
                                    </tr>
                                ))
                            ) : paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-[13px] font-medium">
                                        Belum ada pesanan.
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrderId(order.id)}
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
                                                <span className="truncate block w-full">{order.amount === 0 ? "Gratis" : `Rp ${order.amount.toLocaleString("id-ID")}`}</span>
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
                    <p>Menampilkan <span className="font-semibold text-[#1a1a1a]">{totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, totalItems)}</span> dari <span className="font-semibold text-[#1a1a1a]">{totalItems}</span> data</p>
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

            {/* Transaction Detail Drawer */}
            <OrderDetailDrawer
                orderId={selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
                onStatusUpdated={() => {
                    fetchOrders();
                    fetchStats();
                }}
            />
        </div>
    );
}
