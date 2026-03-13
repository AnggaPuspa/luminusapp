"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Edit2, Trash2, Tag, ArrowUpRight, MoreHorizontal, CheckCircle2, XCircle, X, TrendingUp, Search, Filter, Image as ImageIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Image from "next/image";

export default function AdminPromosPage() {
    const [promos, setPromos] = useState<any[]>([]);
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
        title: "",
        description: "",
        imageUrl: "",
        promoCode: "",
        ctaText: "",
        ctaUrl: "",
        startDate: "",
        endDate: "",
        isActive: true,
        priority: "0"
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            const res = await fetch("/api/admin/promos");
            if (!res.ok) throw new Error("Gagal mengambil data promo");
            const data = await res.json();
            setPromos(data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat promo pop-up");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (promo?: any) => {
        if (promo) {
            setEditingId(promo.id);
            setFormData({
                title: promo.title,
                description: promo.description || "",
                imageUrl: promo.imageUrl || "",
                promoCode: promo.promoCode || "",
                ctaText: promo.ctaText || "",
                ctaUrl: promo.ctaUrl || "",
                startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : "",
                isActive: promo.isActive,
                priority: promo.priority?.toString() || "0"
            });
            setImagePreview(promo.imageUrl || null);
        } else {
            setEditingId(null);
            setFormData({ 
                title: "", 
                description: "", 
                imageUrl: "", 
                promoCode: "", 
                ctaText: "", 
                ctaUrl: "", 
                startDate: new Date().toISOString().slice(0, 16), 
                endDate: "", 
                isActive: true, 
                priority: "0" 
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); setImageFile(null); setImagePreview(null); };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) {
                toast.error("File harus berupa gambar");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran gambar maksimal 5MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Gagal mengunggah gambar");
        }

        const data = await res.json();
        return data.url;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let finalImageUrl = formData.imageUrl;
            
            if (imageFile) {
                setIsUploading(true);
                finalImageUrl = await uploadImage(imageFile);
                setIsUploading(false);
            }

            const url = editingId ? `/api/admin/promos/${editingId}` : "/api/admin/promos";
            const method = editingId ? "PUT" : "POST";
            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                priority: parseInt(formData.priority, 10) || 0
            };
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Terjadi kesalahan");
            toast.success(result.message);
            fetchPromos();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message);
            setIsUploading(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus promo pop-up ini?")) return;
        try {
            const res = await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            toast.success(result.message);
            fetchPromos();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const activePromos = promos.filter(p => p.isActive).length;
    const now = new Date();
    const scheduledPromos = promos.filter(p => p.isActive && new Date(p.startDate) > now).length;
    const expiredPromos = promos.filter(p => p.endDate && new Date(p.endDate) < now).length;

    const filteredPromos = promos.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.promoCode && p.promoCode.toLowerCase().includes(searchTerm.toLowerCase()));
        let matchStatus = true;
        
        // Detailed status filtering logic
        const isCurrentlyActive = p.isActive && new Date(p.startDate) <= now && (!p.endDate || new Date(p.endDate) >= now);
        const isScheduled = p.isActive && new Date(p.startDate) > now;
        const isExpired = p.endDate && new Date(p.endDate) < now;

        if (statusFilter === "ACTIVE") matchStatus = isCurrentlyActive;
        else if (statusFilter === "INACTIVE") matchStatus = !p.isActive;
        else if (statusFilter === "SCHEDULED") matchStatus = isScheduled;
        else if (statusFilter === "EXPIRED") matchStatus = isExpired;

        return matchSearch && matchStatus;
    });

    const totalItems = filteredPromos.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPromos = filteredPromos.slice(startIndex, startIndex + pageSize);

    // Helper for rendering Real-Time Pie Chart on Mini Cards
    const renderMiniChart = (value: number, total: number, color: string = "#4F46E5") => {
        const safeValue = isNaN(value) ? 0 : value;
        const safeTotal = isNaN(total) || total === 0 ? 1 : total;
        const percentage = loading ? 0 : Math.min(Math.max((safeValue / safeTotal) * 100, 0), 100);
        
        const data = [
            { name: "Value", value: percentage },
            { name: "Remainder", value: 100 - percentage }
        ];

        return (
            <div className="w-[72px] h-[72px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={22}
                            outerRadius={32}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                        >
                            <Cell fill={color} />
                            <Cell fill="#f4f5f7" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Helper to get descriptive status badge
    const getStatusBadge = (promo: any) => {
        if (!promo.isActive) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-gray-100 text-gray-500">
                    <XCircle className="w-3 h-3" /> Nonaktif
                </span>
            );
        }

        const promoStart = new Date(promo.startDate);
        const promoEnd = promo.endDate ? new Date(promo.endDate) : null;
        
        if (promoEnd && promoEnd < now) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-red-100 text-red-600">
                    <XCircle className="w-3 h-3" /> Kedaluwarsa
                </span>
            );
        }

        if (promoStart > now) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-blue-100 text-blue-600">
                    <TrendingUp className="w-3 h-3" /> Terjadwal
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#F0FDF4] text-[#22C55E]">
                <CheckCircle2 className="w-3 h-3" /> Sedang Aktif
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* Top Section: Overview + Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left: Promo Overview */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-7 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Manajemen Promo Pop-up</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-1.5 bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#4338CA] transition-colors"
                            >
                                <Plus className="w-4 h-4" strokeWidth={2.5} /> Buat Promo
                            </button>
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-[34px] font-bold text-[#1a1a1a] leading-none">{activePromos} Aktif</h3>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#84C529]" strokeWidth={2.5} />
                                <span className="text-[13px] font-medium text-[#8e95a5]">{promos.length} total promo dibuat</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : promos.length === 0 ? (
                            <div className="py-8 text-center text-[13px] text-[#8e95a5] font-medium">Belum ada promo. Buat promo pertama Anda.</div>
                        ) : (
                            <div>
                                <p className="text-[13px] text-gray-500 mb-2">Hanya 1 promo pop-up (dengan prioritas tertinggi) yang akan ditampilkan kepada pengunjung secara bersamaan.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: 4 Stat Mini Cards */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Promo</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : promos.length}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> {activePromos} status aktif
                                </p>
                            </div>
                            <div className="flex justify-center items-center shrink-0">
                                {renderMiniChart(activePromos, promos.length, "#4F46E5")}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Sedang Tampil</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : promos.filter(p => p.isActive && new Date(p.startDate) <= now && (!p.endDate || new Date(p.endDate) >= now)).length}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Pop-up landing page
                                </p>
                            </div>
                            <div className="flex justify-center items-center shrink-0">
                                {renderMiniChart(promos.filter(p => p.isActive && new Date(p.startDate) <= now && (!p.endDate || new Date(p.endDate) >= now)).length, promos.length, "#22C55E")}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Promo Terjadwal</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : scheduledPromos}</p>
                                <p className="text-blue-600 font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Akan datang
                                </p>
                            </div>
                            <div className="flex justify-center items-center shrink-0">
                                {renderMiniChart(scheduledPromos, promos.length, "#3B82F6")}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Kedaluwarsa</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : expiredPromos}</p>
                                <p className="text-red-500 font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Masa berlaku habis
                                </p>
                            </div>
                            <div className="flex justify-center items-center shrink-0">
                                {renderMiniChart(expiredPromos, promos.length, "#EF4444")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Promo Data Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Daftar Promo Pop-up</h2>
                        <p className="text-[13px] text-[#8e95a5] font-medium mt-0.5">Kelola konten dan banner pop-up landing page</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari judul promo..."
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
                                <option value="ALL">Semua Status</option>
                                <option value="ACTIVE">Sedang Tampil (Aktif)</option>
                                <option value="INACTIVE">Nonaktif</option>
                                <option value="SCHEDULED">Terjadwal</option>
                                <option value="EXPIRED">Kedaluwarsa</option>
                            </select>
                            <Filter className="w-[14px] h-[14px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-4 font-normal w-[30%]">Judul Promo</th>
                                <th className="px-4 py-4 font-normal w-[15%]">Visual</th>
                                <th className="px-4 py-4 font-normal w-[18%]">Kode Promo</th>
                                <th className="px-4 py-4 font-normal w-[17%]">Periode / Status</th>
                                <th className="px-4 py-4 font-normal w-[8%] text-center">Prioritas</th>
                                <th className="px-4 py-4 font-normal w-[12%] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#8e95a5] font-medium">
                                        Memuat data promo...
                                    </td>
                                </tr>
                            ) : filteredPromos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Tag className="w-8 h-8 text-gray-300" />
                                            <p className="text-[13px] font-semibold text-[#1a1a1a]">{searchTerm || statusFilter !== 'ALL' ? 'Tidak ada promo ditemukan' : 'Belum ada promo pop-up'}</p>
                                            <p className="text-[12px] text-[#8e95a5] font-medium">{searchTerm || statusFilter !== 'ALL' ? 'Coba ubah filter pencarian' : "Klik 'Buat Promo' untuk mulai menambah pop-up."}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPromos.map((promo) => (
                                    <tr key={promo.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                        {/* Info */}
                                        <td className="p-0">
                                            <div className="py-3 flex flex-col justify-center px-4 overflow-hidden">
                                                <span className="font-bold text-[#1a1a1a] text-[13px] truncate block w-full">{promo.title}</span>
                                                <span className="text-[11px] text-[#8e95a5] font-medium mt-0.5 truncate block">{promo.description || '-'}</span>
                                            </div>
                                        </td>
                                        {/* Visual */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                {promo.imageUrl ? (
                                                    <div className="w-16 h-10 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                        <Image
                                                            src={promo.imageUrl}
                                                            alt={promo.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {/* Kupon */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex flex-col justify-center px-4 overflow-hidden">
                                                {promo.promoCode ? (
                                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#EEEDFA] text-[#4F46E5] w-max max-w-full truncate">
                                                        {promo.promoCode}
                                                    </span>
                                                ) : (
                                                    <span className="text-[12px] text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Status & Periode */}
                                        <td className="p-0">
                                            <div className="py-3 flex flex-col justify-center px-4">
                                                {getStatusBadge(promo)}
                                                <span className="text-[10px] text-gray-400 mt-1 truncate">
                                                    Mulai: {format(new Date(promo.startDate), "dd MMM yyyy", { locale: id })}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Priority */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center justify-center px-4">
                                                <span className="font-medium text-[13px]">{promo.priority}</span>
                                            </div>
                                        </td>
                                        {/* Aksi */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center justify-end px-4 gap-1.5">
                                                <button
                                                    onClick={() => handleOpenModal(promo)}
                                                    className="p-1.5 text-gray-400 hover:text-[#4F46E5] hover:bg-[#EEEDFA] rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-[16px] h-[16px]" strokeWidth={2} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-[17px] font-bold text-[#1a1a1a]">{editingId ? "Edit Promo Pop-up" : "Buat Promo Baru"}</h2>
                            <button onClick={handleCloseModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Kiri: Info Dasar */}
                                <div className="col-span-1 md:col-span-7 space-y-5">
                                    {/* TITLE */}
                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Judul Promo *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Contoh: Diskon Kemerdekaan 50%"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                        />
                                    </div>

                                    {/* DESCRIPTION */}
                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Deskripsi Singkat</label>
                                        <textarea
                                            rows={2}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Penjelasan singkat untuk pop-up promosi..."
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors resize-none"
                                        />
                                    </div>

                                    {/* PROMO CODE & CTA */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Kode Promo</label>
                                            <input
                                                type="text"
                                                value={formData.promoCode}
                                                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                                                placeholder="Cth: LUMINUSVIP"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                            />
                                            <p className="text-[11px] text-gray-500 mt-1">Isi jika pengunjung perlu copy kode.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Teks Tombol (CTA)</label>
                                            <input
                                                type="text"
                                                value={formData.ctaText}
                                                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                                placeholder="Cth: Lihat Kelas"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">URL Tombol (CTA URL)</label>
                                            <input
                                                type="text"
                                                value={formData.ctaUrl}
                                                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                                                placeholder="Cth: /kursus atau https://..."
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Kanan: Visual & Settings */}
                                <div className="col-span-1 md:col-span-5 space-y-5 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                                    {/* IMAGE UPLOAD */}
                                    <div>
                                        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">Banner Pop-up *</label>
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors flex justify-center items-center h-[120px] overflow-hidden group cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {imagePreview ? (
                                                <>
                                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <span className="text-white text-xs font-medium">Ubah Gambar</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-xs text-gray-500 font-medium font-medium">Upload Banner Promosi</span>
                                                    <span className="text-[10px] text-gray-400 mt-1">Maks. 5MB, format JPG/PNG/WebP</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* DATES */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Tgl Mulai *</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[12px] bg-white transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Tgl Berakhir</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[12px] bg-white transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* PRIORITY & STATUS */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1.5">Prioritas</label>
                                            <input
                                                type="number"
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-white transition-colors"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Angka lebih tinggi lebih diutamakan</p>
                                        </div>
                                        <div className="flex items-center h-full pt-6">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                                                />
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">Aktifkan Memo</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-gray-100 flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || isUploading}
                                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-70 flex items-center justify-center min-w-[120px]"
                                >
                                    {(isSaving || isUploading) ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : null}
                                    {isUploading ? "Mengunggah..." : isSaving ? "Menyimpan..." : "Simpan Promo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
