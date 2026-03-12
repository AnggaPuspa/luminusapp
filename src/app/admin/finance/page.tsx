"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, Calendar, Search, Download, CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";
import RevenueChart from "@/components/admin/RevenueChart";
import RevenueSplit from "@/components/admin/RevenueSplit";

function fmt(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}
function calcChange(cur: number, prev: number) {
    if (prev === 0) return { value: cur > 0 ? 100 : 0, isPositive: cur >= 0 };
    const c = ((cur - prev) / prev) * 100;
    return { value: Math.round(c * 10) / 10, isPositive: c >= 0 };
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function Trend({ ch }: { ch: { value: number; isPositive: boolean } }) {
    return (
        <span className={`inline-flex items-center gap-0.5 ${ch.isPositive ? 'text-[#84C529] bg-[#84C529]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] px-1.5 py-0.5 rounded`}>
            {ch.isPositive
                ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
                : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />}
            {ch.isPositive ? '+' : ''}{ch.value}%
        </span>
    );
}

export default function FinancePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<"all" | "COURSE" | "SUBSCRIPTION">("all");
    const [selectedMonth, setSelectedMonth] = useState<number | "all">(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => { load(); }, [selectedMonth, selectedYear, currentPage, typeFilter]);

    const load = async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/admin/finance?month=${selectedMonth}&year=${selectedYear}&page=${currentPage}&search=${encodeURIComponent(searchTerm)}&type=${typeFilter}`);
            if (r.ok) setData(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading && !data) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#4F46E5] border-t-transparent animate-spin" />
        </div>
    );

    const s = data?.stats;
    const gc = s ? calcChange(s.grossRevenue.current, s.grossRevenue.prev) : { value: 0, isPositive: true };
    const tc = s ? calcChange(s.taxCollected.current, s.taxCollected.prev) : { value: 0, isPositive: true };
    const nc = s ? calcChange(s.netRevenue.current, s.netRevenue.prev) : { value: 0, isPositive: true };
    const cc = s ? calcChange(s.courseRevenue.current, s.courseRevenue.prev) : { value: 0, isPositive: true };
    const sc2 = s ? calcChange(s.subscriptionRevenue.current, s.subscriptionRevenue.prev) : { value: 0, isPositive: true };

    const txs = data?.transactions?.data || [];
    const total = data?.transactions?.total || 0;
    const pages = data?.transactions?.totalPages || 1;
    const start = (currentPage - 1) * 10;

    const dateLabel = selectedMonth === "all"
        ? `Tahun Ini (${selectedYear})`
        : `${MONTHS[selectedMonth as number].substring(0, 3)} ${selectedYear}`;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* ── Performance Card (reference style) ── */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 shadow-sm overflow-hidden">

                {/* Card Header */}
                <div className="flex items-center justify-between px-7 pt-7 pb-5">
                    <h1 className="text-[20px] font-bold text-[#1a1a1a]">Performa Keuangan</h1>
                    <div className="flex gap-2 relative">
                        {/* Date Picker Button */}
                        <button onClick={() => setShowPicker(!showPicker)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:border-gray-300 bg-white transition-colors">
                            {dateLabel}
                            <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                        </button>
                        {showPicker && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowPicker(false)} />
                                <div className="absolute top-full right-[110px] mt-2 z-40 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 p-4 w-72">
                                    <div className="flex items-center justify-between mb-4">
                                        <button onClick={() => setSelectedYear(y => y - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg font-bold text-gray-500">&lt;</button>
                                        <span className="font-bold text-[15px]">{selectedYear}</span>
                                        <button onClick={() => setSelectedYear(y => y + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg font-bold text-gray-500">&gt;</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <button onClick={() => { setSelectedMonth("all"); setShowPicker(false); }}
                                            className={`col-span-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${selectedMonth === "all" ? "bg-[#4F46E5] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                                            Seluruh Tahun {selectedYear}
                                        </button>
                                        {MONTHS.map((m, i) => (
                                            <button key={m} onClick={() => { setSelectedMonth(i); setShowPicker(false); }}
                                                className={`py-2 rounded-xl text-[12px] font-semibold transition-colors ${selectedMonth === i ? "bg-[#4F46E5] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                                                {m.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <button onClick={() => window.open(`/api/admin/finance/export?month=${selectedMonth}&year=${selectedYear}`, '_blank')}
                            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-600 hover:border-gray-300 bg-white transition-colors">
                            <Download className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            Ekspor
                        </button>
                    </div>
                </div>

                {/* Stats Strip Row 1 — 5 main metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 border-t border-gray-100 divide-x divide-gray-100">
                    {[
                        { label: 'Pendapatan Kotor', val: s?.grossRevenue.current, ch: gc },
                        { label: 'Pajak Dipungut', val: s?.taxCollected.current, ch: tc },
                        { label: 'Pendapatan Bersih', val: s?.netRevenue.current, ch: nc },
                        { label: 'Pendapatan Kursus', val: s?.courseRevenue.current, ch: cc },
                        { label: 'Sub. Berlangganan', val: s?.subscriptionRevenue.current, ch: sc2 },
                    ].map((item, i) => (
                        <div key={i} className="px-6 py-5">
                            <p className="text-[#8e95a5] text-[12px] font-semibold mb-2 uppercase tracking-wider">{item.label}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[18px] font-bold text-[#1a1a1a]">
                                    {item.val !== undefined ? fmt(item.val) : "—"}
                                </span>
                                {s && <Trend ch={item.ch} />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Strip Row 2 — MRR + Coupon, same grid cols-5 = same column width */}
                <div className="grid grid-cols-2 md:grid-cols-5 border-t border-b border-gray-100 divide-x divide-gray-100">
                    <div className="px-6 py-5">
                        <p className="text-[#8e95a5] text-[12px] font-semibold mb-2 uppercase tracking-wider">MRR (Bulanan Berulang)</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[18px] font-bold text-[#1a1a1a]">{s ? fmt(s.mrr.current) : "—"}</span>
                            <span className="text-[#4F46E5] text-[12px] font-bold bg-[#4F46E5]/10 px-1.5 py-0.5 rounded">{s ? s.mrr.subscribers : "—"} subs</span>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <p className="text-[#8e95a5] text-[12px] font-semibold mb-2 uppercase tracking-wider">Dampak Kupon</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#ef4444] text-[18px] font-bold">- {s ? fmt(s.couponImpact.current) : "—"}</span>
                            <span className="text-[#8e95a5] text-[12px] font-semibold">{s ? s.couponImpact.count : "—"} kali dipakai</span>
                        </div>
                    </div>
                    {/* 3 empty cols to maintain 5-col grid alignment */}
                    <div className="hidden md:block" />
                    <div className="hidden md:block" />
                    <div className="hidden md:block" />
                </div>

                {/* Chart + Revenue Split side-by-side */}
                <div className="grid grid-cols-1 xl:grid-cols-3 px-6 pt-4 pb-6 gap-6">
                    <div className="xl:col-span-2">
                        <RevenueChart
                            data={data?.chartData || []}
                            isYearly={selectedMonth === "all"}
                            monthNames={MONTHS}
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <RevenueSplit
                            courseRevenue={s?.courseRevenue.current || 0}
                            subscriptionRevenue={s?.subscriptionRevenue.current || 0}
                        />
                    </div>
                </div>
            </div>

            {/* ── Transactions Table ── */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200/80 overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-[17px] font-bold text-[#1a1a1a]">Rekap Transaksi</h2>
                    <div className="flex gap-2 items-center">
                        <div className="flex rounded-xl overflow-hidden border border-gray-100">
                            {(["all", "COURSE", "SUBSCRIPTION"] as const).map(t => (
                                <button key={t} onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                                    className={`px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${typeFilter === t ? "bg-[#4F46E5] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                                    {t === "all" ? "Semua" : t === "COURSE" ? "Kursus" : "Langganan"}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); load(); }} className="relative hidden md:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Cari transaksi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 transition-all w-52" />
                        </form>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 bg-gray-50/60">
                            <tr>
                                <th className="px-6 py-4 font-bold w-36">Tanggal</th>
                                <th className="px-6 py-4 font-bold">Pelanggan</th>
                                <th className="px-6 py-4 font-bold">Item</th>
                                <th className="px-6 py-4 font-bold w-32">Gross</th>
                                <th className="px-6 py-4 font-bold w-28 text-orange-400">Tax</th>
                                <th className="px-6 py-4 font-bold w-32 text-[#4F46E5]">Net</th>
                                <th className="px-6 py-4 font-bold w-28">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && txs.length === 0 ? (
                                <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-[13px]">Memuat data...</td></tr>
                            ) : txs.length === 0 ? (
                                <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-[13px]">Belum ada transaksi.</td></tr>
                            ) : txs.map((t: any) => {
                                const st = t.status === 'PAID'
                                    ? { label: 'Lunas', cls: 'bg-[#F0FDF4] text-[#22C55E]', icon: <CheckCircle2 className="w-3.5 h-3.5 fill-[#22c55e] text-white" /> }
                                    : t.status === 'FAILED' || t.status === 'EXPIRED'
                                        ? { label: 'Gagal', cls: 'bg-[#FEF2F2] text-[#EF4444]', icon: <XCircle className="w-3.5 h-3.5 fill-[#ef4444] text-white" /> }
                                        : { label: 'Menunggu', cls: 'bg-[#F3F4F6] text-[#4B5563]', icon: <Clock className="w-3.5 h-3.5" strokeWidth={2} /> };
                                return (
                                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#1a1a1a] text-[13.5px]">{format(new Date(t.date), "dd MMM yyyy", { locale: idLocale })}</p>
                                            <p className="text-[12px] text-[#8e95a5]">{format(new Date(t.date), "HH:mm", { locale: idLocale })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#1a1a1a] text-[13.5px] truncate max-w-[180px]">{t.customerName}</p>
                                            <p className="text-[12px] text-[#8e95a5] truncate max-w-[180px]">{t.customerEmail}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#1a1a1a] text-[13px] truncate max-w-[180px]">{t.item}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'COURSE' ? 'bg-indigo-50 text-[#4F46E5]' : 'bg-purple-50 text-purple-600'}`}>{t.type}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-600 text-[13px]">{fmt(t.amount)}</td>
                                        <td className="px-6 py-4 font-semibold text-orange-500 text-[13px]">{fmt(t.tax)}</td>
                                        <td className="px-6 py-4 font-bold text-[#4F46E5] text-[13px]">{fmt(t.net)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${st.cls}`}>
                                                {st.icon}{st.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/40">
                    <p className="text-[13px] text-gray-500">
                        <span className="font-bold text-[#1a1a1a]">{total > 0 ? start + 1 : 0}–{Math.min(start + 10, total)}</span> dari <span className="font-bold text-[#1a1a1a]">{total}</span> transaksi
                    </p>
                    <div className="flex items-center gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:border hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm">&lt;</button>
                        <span className="px-3 font-semibold text-[13px] text-gray-600">{currentPage} / {pages}</span>
                        <button disabled={currentPage === pages || pages === 0} onClick={() => setCurrentPage(p => Math.min(p + 1, pages))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:border hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
