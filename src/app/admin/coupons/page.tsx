"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
            setFormData({
                code: "",
                discountType: "PERCENTAGE",
                discountValue: 0,
                maxUses: "",
                minPurchase: "",
                validUntil: "",
                isActive: true,
                courseId: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

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

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

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
        if (!confirm("Yakin ingin menghapus kupon ini? Transaksi yang sudah menggunakan kupon ini tidak akan terpengaruh.")) return;

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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Kupon Diskon</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Tambah Kupon
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm border-b">
                        <tr>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">KODE Kupon</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Potongan</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Pemakaian</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 whitespace-nowrap">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        Memuat data kupon...
                                    </div>
                                </td>
                            </tr>
                        ) : coupons.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                    Belum ada kupon diskon yang dibuat.
                                </td>
                            </tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 font-mono tracking-wide">{coupon.code}</div>
                                        {coupon.minPurchase && (
                                            <div className="text-xs text-gray-500 mt-1">Min. Rp {coupon.minPurchase.toLocaleString('id-ID')}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.discountType === "PERCENTAGE" ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                                                {coupon.discountValue}% Off
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                                                - Rp {coupon.discountValue.toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <span className="font-semibold">{coupon.usedCount}</span>
                                            <span className="text-gray-400"> / {coupon.maxUses ? coupon.maxUses : '∞'} Terpakai</span>
                                        </div>
                                        {coupon.validUntil && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Exp: {format(new Date(coupon.validUntil), 'dd MMM yyyy, HH:mm')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Nonaktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(coupon)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="Edit Kupon"
                                            >
                                                <i className="fa-regular fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                title="Hapus Kupon"
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{editingId ? "Edit Kupon Promo" : "Buat Kupon Baru"}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* KODE */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kode Kupon *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="Misal: DISKON50"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                                    />
                                </div>

                                {/* TIPE DISKON */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Diskon *</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="PERCENTAGE">Persentase (%)</option>
                                        <option value="FIXED">Potongan Fix (Rp)</option>
                                    </select>
                                </div>

                                {/* NOMINAL DISKON */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nominal Diskon *</label>
                                    <div className="relative">
                                        {formData.discountType === "FIXED" && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                                        )}
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                            className={`w-full py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formData.discountType === "FIXED" ? 'pl-9 pr-4' : 'px-4'}`}
                                        />
                                        {formData.discountType === "PERCENTAGE" && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                                        )}
                                    </div>
                                </div>

                                {/* MAX USES */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Maksimal Pemakaian</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        placeholder="Kosongkan jika unlimited"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* MIN PURCHASE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min. Harga Beli (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                        placeholder="Opsional"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* EXACT EXPIRE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Berlaku Sampai</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada kedaluwarsa.</p>
                                </div>

                                {/* STATUS */}
                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">Kupon Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-70 flex items-center justify-center min-w-[120px]"
                                >
                                    {isSaving ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Menyimpan...</>
                                    ) : "Simpan Kupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
