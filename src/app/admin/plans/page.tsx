"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Award, Users } from "lucide-react";
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            // Fetch full plan details
            const res = await fetch(`/api/admin/plans`); // Usually we'd fetch by ID but our API returns all
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

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Paket Langganan</h1>
                        <p className="text-gray-500 text-sm mt-1">Atur tarif berlangganan dan akses fitur premium.</p>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#A855F7] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#9333EA] transition-colors shadow-sm shadow-purple-200"
                    >
                        <Plus className="w-5 h-5" /> Buat Paket Baru
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
                        ))}
                    </div>
                ) : plans.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-300">
                        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Paket Langganan</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">Buat paket subscription (Biasa, Murid, Profesional) untuk mulai menjual akses hybrid e-learning.</p>
                        <button onClick={handleCreateNew} className="text-[#A855F7] font-bold hover:underline">
                            + Buat Paket Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.id} className={`bg-white rounded-2xl border ${plan.isActive ? 'border-gray-200 shadow-sm hover:shadow-md' : 'border-gray-200 opacity-75'} p-6 transition-all flex flex-col relative`}>

                                {/* Status Badge */}
                                <div className="absolute top-6 right-6 flex items-center gap-1.5">
                                    {plan.isActive ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md uppercase">
                                            <CheckCircle2 className="w-3 h-3" /> Aktif
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase">
                                            <XCircle className="w-3 h-3" /> Nonaktif
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] uppercase font-bold tracking-wider rounded-md mb-3">
                                        Tier {plan.tier}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{plan.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[32px]">{plan.description || "Tidak ada deskripsi"}</p>
                                </div>

                                <div className="py-4 border-y border-gray-100 mb-4">
                                    <div className="flex items-end gap-1">
                                        <span className="text-2xl font-black text-gray-900">{formatCurrency(plan.monthlyPrice).replace(',00', '')}</span>
                                        <span className="text-sm font-medium text-gray-500 mb-1">/bln</span>
                                    </div>
                                    {plan.yearlyPrice && (
                                        <p className="text-xs font-semibold text-green-600 mt-1 bg-green-50 inline-block px-2 py-0.5 rounded">
                                            {formatCurrency(plan.yearlyPrice).replace(',00', '')} / Tahun
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-semibold uppercase">Subscriber</span>
                                        <span className="font-bold text-gray-900 flex items-center gap-1.5 mt-0.5">
                                            <Users className="w-4 h-4 text-[#A855F7]" /> {plan._count.subscriptions} User
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs text-gray-400 font-semibold uppercase">Akses Kelas</span>
                                        <span className="font-bold text-gray-900 mt-0.5">
                                            {plan.allCoursesIncluded ? 'Semua Kelas' : `${plan._count.includedCourses} Kelas`}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleEdit(plan.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        disabled={plan._count.subscriptions > 0}
                                        className="w-11 flex-shrink-0 flex items-center justify-center border border-red-100 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={plan._count.subscriptions > 0 ? "Tidak bisa dihapus karena ada subscriber aktif" : "Hapus Paket"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>

            <PlanFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingPlan}
                onSaved={fetchPlans}
            />
        </>
    );
}
