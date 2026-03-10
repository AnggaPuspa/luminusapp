"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Edit2, Trash2, Tag, ArrowUpRight, MoreHorizontal, CheckCircle2, XCircle, X, TrendingUp, Search, Filter } from "lucide-react";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxUses: "",
        minPurchase: "",
        validUntil: "",
        isActive: true,
        courseId: ""
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/coupons");
            if (!res.ok) throw new Error("Gagal mengambil data kupon");
            const data = await res.json();
            setCoupons(data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat kupon diskon");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (coupon?: any) => {
        if (coupon) {
            setEditingId(coupon.id);
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxUses: coupon.maxUses?.toString() || "",
                minPurchase: coupon.minPurchase?.toString() || "",
                validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
                isActive: coupon.isActive,
                courseId: coupon.courseId || ""
            });
        } else {
            setEditingId(null);
            setFormData({ code: "", discountType: "PERCENTAGE", discountValue: 0, maxUses: "", minPurchase: "", validUntil: "", isActive: true, courseId: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
            const method = editingId ? "PUT" : "POST";
            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                discountValue: Number(formData.discountValue),
                maxUses: formData.maxUses ? Number(formData.maxUses) : null,
                minPurchase: formData.minPurchase ? Number(formData.minPurchase) : null,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
                courseId: formData.courseId || null
            };
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Terjadi kesalahan");
            toast.success(result.message);
            fetchCoupons();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus kupon ini?")) return;
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            toast.success(result.message);
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const activeCoupons = coupons.filter(c => c.isActive).length;
    const totalUsed = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);
    const percentageCoupons = coupons.filter(c => c.discountType === "PERCENTAGE").length;
    const fixedCoupons = coupons.filter(c => c.discountType === "FIXED").length;

    const filteredCoupons = coupons.filter(c => {
        const matchSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? c.isActive : !c.isActive);
        return matchSearch && matchStatus;
    });

    const totalItems = filteredCoupons.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCoupons = filteredCoupons.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* Top Section: Overview + Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left: Coupon Overview */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-7 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Coupon Overview</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-1.5 bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#4338CA] transition-colors"
                            >
                                <Plus className="w-4 h-4" strokeWidth={2.5} /> Buat Kupon
                            </button>
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-[34px] font-bold text-[#1a1a1a] leading-none">{activeCoupons} Aktif</h3>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#84C529]" strokeWidth={2.5} />
                                <span className="text-[13px] font-medium text-[#8e95a5]">{coupons.length} total kupon terdaftar</span>
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#8e95a5]">{totalUsed} total pemakaian</span>
                    </div>

                    {/* Coupon type breakdown bars */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="py-8 text-center text-[13px] text-[#8e95a5] font-medium">Belum ada kupon. Buat kupon pertama Anda.</div>
                        ) : (
                            <>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[13px] font-semibold text-[#1a1a1a]">Persentase (%)</span>
                                        <span className="text-[12px] text-[#8e95a5] font-medium">{percentageCoupons} kupon ({coupons.length > 0 ? Math.round((percentageCoupons / coupons.length) * 100) : 0}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-[7px] overflow-hidden">
                                        <div className="bg-[#4F46E5] h-full rounded-full" style={{ width: `${coupons.length > 0 ? Math.max((percentageCoupons / coupons.length) * 100, 3) : 0}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[13px] font-semibold text-[#1a1a1a]">Fixed (Rp)</span>
                                        <span className="text-[12px] text-[#8e95a5] font-medium">{fixedCoupons} kupon ({coupons.length > 0 ? Math.round((fixedCoupons / coupons.length) * 100) : 0}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-[7px] overflow-hidden">
                                        <div className="bg-[#374151] h-full rounded-full" style={{ width: `${coupons.length > 0 ? Math.max((fixedCoupons / coupons.length) * 100, 3) : 0}%` }} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: 4 Stat Mini Cards */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Kupon</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : coupons.length}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> {activeCoupons} aktif
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-45 shrink-0"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Pemakaian</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : totalUsed}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Kali dipakai
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 border-b-gray-100 rotate-[-15deg] shrink-0"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Tipe Persentase</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : percentageCoupons}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Kupon % off
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-l-gray-100 border-r-gray-100 border-t-gray-100 rotate-[40deg] shrink-0"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Tipe Fixed</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : fixedCoupons}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Kupon potongan Rp
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-b-gray-100 rotate-[90deg] shrink-0"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Coupons Data Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Daftar Kupon Diskon</h2>
                        <p className="text-[13px] text-[#8e95a5] font-medium mt-0.5">Kelola kode promo dan batasan pemakaian</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari kode kupon..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors w-56 hover:bg-gray-100"
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
                                <option value="INACTIVE">Nonaktif</option>
                            </select>
                            <Filter className="w-[14px] h-[14px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-4 font-normal w-[22%]">Kode Kupon</th>
                                <th className="px-4 py-4 font-normal w-[16%]">Tipe Diskon</th>
                                <th className="px-4 py-4 font-normal w-[18%]">Pemakaian</th>
                                <th className="px-4 py-4 font-normal w-[20%]">Berlaku Sampai</th>
                                <th className="px-4 py-4 font-normal w-[12%]">Status</th>
                                <th className="px-4 py-4 font-normal w-[12%] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#8e95a5] font-medium">
                                        Memuat data kupon...
                                    </td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Tag className="w-8 h-8 text-gray-300" />
                                            <p className="text-[13px] font-semibold text-[#1a1a1a]">{searchTerm || statusFilter !== 'ALL' ? 'Tidak ada kupon ditemukan' : 'Belum ada kupon'}</p>
                                            <p className="text-[12px] text-[#8e95a5] font-medium">{searchTerm || statusFilter !== 'ALL' ? 'Coba ubah filter pencarian' : "Klik 'Buat Kupon' untuk memulai"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                        {/* Kode */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex flex-col justify-center px-4 overflow-hidden">
                                                <span className="font-bold text-[#1a1a1a] text-[13px] font-mono tracking-widest truncate block w-full">{coupon.code}</span>
                                                {coupon.minPurchase && (
                                                    <span className="text-[11px] text-[#8e95a5] font-medium mt-0.5 truncate block">Min. Rp {coupon.minPurchase.toLocaleString('id-ID')}</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Tipe Diskon */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                {coupon.discountType === "PERCENTAGE" ? (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#EEEDFA] text-[#4F46E5]">
                                                        {coupon.discountValue}% Off
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#F0FDF4] text-[#22C55E]">
                                                        Rp {coupon.discountValue.toLocaleString('id-ID')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Pemakaian */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex flex-col justify-center px-4 overflow-hidden">
                                                <span className="font-semibold text-[#1a1a1a] text-[13px]">
                                                    {coupon.usedCount} <span className="font-medium text-[#8e95a5]">/ {coupon.maxUses ?? '∞'}</span>
                                                </span>
                                                {coupon.maxUses && (
                                                    <div className="w-full bg-gray-100 rounded-full h-[4px] mt-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-[#4F46E5] h-full rounded-full"
                                                            style={{ width: `${Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100))}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {/* Berlaku Sampai */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 text-[#8e95a5] text-[13px] font-medium whitespace-nowrap overflow-hidden">
                                                <span className="truncate block w-full">
                                                    {coupon.validUntil
                                                        ? format(new Date(coupon.validUntil), "dd MMM yyyy, HH:mm", { locale: id })
                                                        : "Tanpa kedaluwarsa"
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                {coupon.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#F0FDF4] text-[#22C55E]">
                                                        <CheckCircle2 className="w-3 h-3" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-gray-100 text-gray-500">
                                                        <XCircle className="w-3 h-3" /> Nonaktif
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Aksi */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center justify-end px-4 gap-1.5">
                                                <button
                                                    onClick={() => handleOpenModal(coupon)}
                                                    className="p-1.5 text-gray-400 hover:text-[#4F46E5] hover:bg-[#EEEDFA] rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-[16px] h-[16px]" strokeWidth={2} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-1.5 text-gray-400 hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-[16px] h-[16px]" strokeWidth={2} />
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
                            let pageNum = currentPage;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                                <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md font-medium transition-colors ${currentPage === pageNum ? "bg-[#4F46E5] text-white shadow-sm font-semibold" : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                                        }`}>{pageNum}</button>
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

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-[17px] font-bold text-[#1a1a1a]">{editingId ? "Edit Kupon Promo" : "Buat Kupon Baru"}</h2>
                            <button onClick={handleCloseModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* KODE */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Kode Kupon *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="Misal: DISKON50"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] font-mono uppercase text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                    />
                                </div>

                                {/* TIPE DISKON */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Tipe Diskon *</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                                    >
                                        <option value="PERCENTAGE">Persentase (%)</option>
                                        <option value="FIXED">Potongan Fix (Rp)</option>
                                    </select>
                                </div>

                                {/* NOMINAL DISKON */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Nilai Diskon *</label>
                                    <div className="relative">
                                        {formData.discountType === "FIXED" && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8e95a5] text-[13px] font-medium">Rp</span>
                                        )}
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                            className={`w-full py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors ${formData.discountType === "FIXED" ? 'pl-9 pr-4' : 'px-4'}`}
                                        />
                                        {formData.discountType === "PERCENTAGE" && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8e95a5] text-[13px] font-medium">%</span>
                                        )}
                                    </div>
                                </div>

                                {/* MAX USES */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Maks. Pemakaian</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        placeholder="Kosongkan = unlimited"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                    />
                                </div>

                                {/* MIN PURCHASE */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Min. Pembelian (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                        placeholder="Opsional"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                    />
                                </div>

                                {/* EXPIRE DATE */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Berlaku Sampai</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                    />
                                    <p className="text-[11px] text-[#8e95a5] mt-1 font-medium">Kosongkan jika tidak ada kedaluwarsa.</p>
                                </div>

                                {/* STATUS */}
                                <div className="flex items-center h-full pt-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                                        />
                                        <span className="text-[13px] font-semibold text-[#1a1a1a]">Kupon Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-70 flex items-center justify-center min-w-[120px]"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : null}
                                    {isSaving ? "Menyimpan..." : "Simpan Kupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
