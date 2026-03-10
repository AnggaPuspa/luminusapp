"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowUpRight, MoreHorizontal, Users, BookOpen, CheckCircle2, XCircle, Award, TrendingUp, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import PlanFormModal from "@/components/admin/PlanFormModal";

interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: string;
    description: string | null;
    monthlyPrice: number;
    yearlyPrice: number | null;
    isActive: boolean;
    allCoursesIncluded: boolean;
    _count: {
        subscriptions: number;
        includedCourses: number;
    }
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/plans");
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCreateNew = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleEdit = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/plans`);
            const allPlans = await res.json();
            const planToEdit = allPlans.find((p: any) => p.id === id);
            if (planToEdit) {
                setEditingPlan(planToEdit);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus paket ini secara permanen?")) return;
        try {
            const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Paket dihapus");
                fetchPlans();
            } else {
                const data = await res.json();
                toast.error(data.message || "Gagal menghapus paket");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
    };

    const totalSubscribers = plans.reduce((acc, p) => acc + p._count.subscriptions, 0);
    const activePlans = plans.filter(p => p.isActive).length;
    const mostPopularPlan = plans.length > 0 ? plans.reduce((a, b) => a._count.subscriptions > b._count.subscriptions ? a : b) : null;

    const filteredPlans = plans.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.tier.includes(searchTerm);
        const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? p.isActive : !p.isActive);
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* Top Section: Overview Chart + 4 Stat Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left: Plan Overview Panel (replaces chart) */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-7 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Plan Overview</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center gap-1.5 bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#4338CA] transition-colors"
                            >
                                <Plus className="w-4 h-4" strokeWidth={2.5} /> Buat Plan
                            </button>
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
                                <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    {/* Summary Numbers */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-[34px] font-bold text-[#1a1a1a] leading-none">{activePlans} Aktif</h3>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#84C529]" strokeWidth={2.5} />
                                <span className="text-[13px] font-medium text-[#8e95a5]">{plans.length} total plan terdaftar</span>
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#8e95a5]">{totalSubscribers} total subscribers</span>
                    </div>

                    {/* Plan Tier Distribution Bar */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="py-8 text-center text-[13px] text-[#8e95a5] font-medium">Belum ada plan. Buat plan pertama Anda.</div>
                        ) : (
                            plans.map((plan) => {
                                const pct = totalSubscribers > 0 ? Math.round((plan._count.subscriptions / totalSubscribers) * 100) : 0;
                                return (
                                    <div key={plan.id}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">{plan.name}</span>
                                                <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wide">Tier {plan.tier}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">{formatCurrency(plan.monthlyPrice).replace(',00', '')}</span>
                                                <span className="text-[12px] text-[#8e95a5] font-medium">{plan._count.subscriptions} subs ({pct}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-[7px] overflow-hidden">
                                            <div
                                                className="bg-[#4F46E5] h-full rounded-full transition-all duration-700"
                                                style={{ width: `${Math.max(pct, 3)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: 4 Stat Mini Cards */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Subscribers</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : totalSubscribers.toLocaleString("id-ID")}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> All plans
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-45 shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Plan Aktif</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : activePlans}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> dari {plans.length} total
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 border-b-gray-100 rotate-[-15deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Plan Terpopuler</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2 truncate max-w-[120px]">{loading ? "—" : (mostPopularPlan?.name || "—")}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> {mostPopularPlan?._count.subscriptions || 0} subs
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-l-gray-100 border-r-gray-100 border-t-gray-100 rotate-[40deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Plans</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : plans.length}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Tier tersedia
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-b-gray-100 rotate-[90deg] shrink-0"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Plans Detail Cards */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Daftar Paket Langganan</h2>
                        <p className="text-[13px] text-[#8e95a5] font-medium mt-0.5">Kelola skema harga dan akses fitur per tier</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama plan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors w-52 hover:bg-gray-100"
                            />
                        </div>
                        <div className="relative hidden sm:block">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors cursor-pointer hover:bg-gray-100 text-gray-600"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Aktif</option>
                                <option value="INACTIVE">Draft</option>
                            </select>
                            <Filter className="w-[14px] h-[14px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-56 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center gap-3">
                        <Award className="w-10 h-10 text-gray-300" />
                        <p className="text-[14px] font-semibold text-[#1a1a1a]">{searchTerm || statusFilter !== 'ALL' ? 'Tidak ada plan ditemukan' : 'Belum ada paket'}</p>
                        <p className="text-[13px] text-[#8e95a5] font-medium">{searchTerm || statusFilter !== 'ALL' ? 'Coba ubah filter pencarian' : "Klik 'Buat Plan' untuk memulai"}</p>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="border border-gray-100 rounded-xl p-5 flex flex-col hover:border-gray-200 hover:shadow-sm transition-all"
                                >
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider block mb-1">TIER {plan.tier}</span>
                                            <h3 className="text-[13.5px] font-semibold text-[#1a1a1a] leading-tight">{plan.name}</h3>
                                        </div>
                                        {plan.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#F0FDF4] text-[#22C55E]">
                                                <CheckCircle2 className="w-3 h-3" /> Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-gray-100 text-gray-500">
                                                <XCircle className="w-3 h-3" /> Draft
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-[12px] text-[#8e95a5] font-medium leading-relaxed mb-4 line-clamp-2 flex-1">
                                        {plan.description || "Tidak ada deskripsi."}
                                    </p>

                                    {/* Price */}
                                    <div className="border-t border-gray-50 pt-4 mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[24px] font-bold text-[#1a1a1a]">{formatCurrency(plan.monthlyPrice).replace(',00', '')}</span>
                                            <span className="text-[12px] font-medium text-[#8e95a5]">/bln</span>
                                        </div>
                                        {plan.yearlyPrice ? (
                                            <p className="text-[12px] font-medium text-[#8e95a5] mt-0.5">
                                                {formatCurrency(plan.yearlyPrice).replace(',00', '')} / tahun
                                            </p>
                                        ) : (
                                            <p className="text-[12px] font-medium text-[#8e95a5] mt-0.5 italic">Hanya bulanan</p>
                                        )}
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-4 mb-4 text-[12px] font-medium text-[#8e95a5]">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{plan._count.subscriptions} subscribers</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>{plan.allCoursesIncluded ? "Full Access" : `${plan._count.includedCourses} kelas`}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(plan.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#4F46E5] hover:border-[#4F46E5]/30 transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Plan
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            disabled={plan._count.subscriptions > 0}
                                            title={plan._count.subscriptions > 0 ? "Ada subscriber aktif" : "Hapus plan"}
                                            className="w-10 flex items-center justify-center border border-gray-100 text-gray-400 rounded-lg hover:bg-[#FEF2F2] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <PlanFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingPlan}
                onSaved={fetchPlans}
            />
        </div>
    );
}
