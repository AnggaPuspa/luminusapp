import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any | null;
    onSaved: () => void;
}

export default function PlanFormModal({ isOpen, onClose, initialData, onSaved }: PlanFormModalProps) {
    const [name, setName] = useState("");
    const [tier, setTier] = useState("MURID");
    const [description, setDescription] = useState("");
    const [monthlyPrice, setMonthlyPrice] = useState("");
    const [yearlyPrice, setYearlyPrice] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [allCoursesIncluded, setAllCoursesIncluded] = useState(false);
    const [aiMentorQuota, setAiMentorQuota] = useState("0");
    const [communityInviteUrl, setCommunityInviteUrl] = useState("");
    const [features, setFeatures] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "");
                setTier(initialData.tier || "MURID");
                setDescription(initialData.description || "");
                setMonthlyPrice(initialData.monthlyPrice?.toString() || "");
                setYearlyPrice(initialData.yearlyPrice?.toString() || "");
                setIsActive(initialData.isActive ?? true);
                setAllCoursesIncluded(initialData.allCoursesIncluded ?? false);
                setAiMentorQuota(initialData.aiMentorQuota?.toString() || "0");
                setCommunityInviteUrl(initialData.communityInviteUrl || "");
                try {
                    const parsedFeatures = typeof initialData.features === 'string' ? JSON.parse(initialData.features) : initialData.features;
                    setFeatures(Array.isArray(parsedFeatures) ? parsedFeatures : []);
                } catch {
                    setFeatures([]);
                }
            } else {
                setName(""); setTier("MURID"); setDescription(""); setMonthlyPrice("");
                setYearlyPrice(""); setIsActive(true); setAllCoursesIncluded(false);
                setAiMentorQuota("0"); setCommunityInviteUrl(""); setFeatures([]);
            }
        }
    }, [isOpen, initialData]);

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const formatCurrencyInput = (valStr: string) => {
        if (!valStr) return "";
        const num = parseInt(valStr, 10);
        if (isNaN(num)) return "";
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const handleCurrenyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        const numericStr = e.target.value.replace(/\D/g, "");
        setter(numericStr);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            name, tier, description,
            monthlyPrice: parseInt(monthlyPrice) || 0,
            yearlyPrice: yearlyPrice ? parseInt(yearlyPrice) : null,
            isActive, allCoursesIncluded,
            aiMentorQuota: parseInt(aiMentorQuota) || 0,
            communityInviteUrl,
            features: features.filter(f => f.trim() !== "")
        };
        try {
            const url = initialData ? `/api/admin/plans/${initialData.id}` : `/api/admin/plans`;
            const method = initialData ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                toast.success(`Paket berhasil ${initialData ? 'diperbarui' : 'dibuat'}`);
                onSaved();
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || data.message || "Gagal menyimpan paket");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] text-[13px] bg-gray-50 hover:bg-white transition-colors";
    const labelClass = "block text-[13px] font-semibold text-[#1a1a1a] mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-[17px] font-bold text-[#1a1a1a]">
                        {initialData ? "Edit Paket Langganan" : "Buat Paket Baru"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <form id="planForm" onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* Nama + Tier */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nama Paket *</label>
                                <input
                                    required type="text" value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Paket Murid"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Tingkat Tier</label>
                                <select
                                    value={tier}
                                    onChange={(e) => setTier(e.target.value)}
                                    className={inputClass + " cursor-pointer"}
                                >
                                    <option value="BIASA">Biasa (Basic)</option>
                                    <option value="MURID">Murid (Standard)</option>
                                    <option value="PROFESIONAL">Profesional (Pro)</option>
                                </select>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className={labelClass}>Deskripsi Singkat</label>
                            <input
                                type="text" value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Cocok untuk mulai belajar coding dari nol"
                                className={inputClass}
                            />
                        </div>

                        {/* Harga */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Harga Bulanan *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-medium text-[13px]">Rp</span>
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={formatCurrencyInput(monthlyPrice)}
                                        onChange={(e) => handleCurrenyChange(e, setMonthlyPrice)}
                                        placeholder="0"
                                        className={`${inputClass} pl-[42px]`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Harga Tahunan <span className="text-[#8e95a5] font-normal">— Opsional</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-medium text-[13px]">Rp</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formatCurrencyInput(yearlyPrice)}
                                        onChange={(e) => handleCurrenyChange(e, setYearlyPrice)}
                                        placeholder="0"
                                        className={`${inputClass} pl-[42px]`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 pt-1">
                            <p className="text-[12px] font-semibold text-[#8e95a5] uppercase tracking-wide mb-4">Pengaturan Akses</p>

                            {/* All Access Toggle */}
                            <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mb-3">
                                <input
                                    type="checkbox"
                                    checked={allCoursesIncluded}
                                    onChange={(e) => setAllCoursesIncluded(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                                />
                                <div>
                                    <p className="text-[13px] font-semibold text-[#1a1a1a]">Buka Semua Kelas (All Access)</p>
                                    <p className="text-[12px] text-[#8e95a5] font-medium mt-0.5">Jika dicentang, user bisa mengakses semua course tanpa batas.</p>
                                </div>
                            </label>

                            {!allCoursesIncluded && (
                                <div className="p-3 bg-[#FEF9C3] text-[#854D0E] text-[12px] font-medium border border-[#FDE68A] rounded-lg mb-3">
                                    ⚠️ Paket terbatas. Anda harus assign course secara manual setelah paket dibuat.
                                </div>
                            )}

                            {/* AI Quota + Community */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Limit AI Chat / Bulan</label>
                                    <input
                                        required type="number" min="0" value={aiMentorQuota}
                                        onChange={(e) => setAiMentorQuota(e.target.value)}
                                        className={inputClass}
                                    />
                                    <p className="text-[11px] text-[#8e95a5] font-medium mt-1">Ketik 0 jika unlimited.</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Link Invite VIP Community</label>
                                    <input
                                        type="url" value={communityInviteUrl}
                                        onChange={(e) => setCommunityInviteUrl(e.target.value)}
                                        placeholder="https://discord.gg/..."
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[12px] font-semibold text-[#8e95a5] uppercase tracking-wide">List Fitur (Pricing Page)</p>
                                <button
                                    type="button"
                                    onClick={() => setFeatures([...features, ""])}
                                    className="flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] bg-[#EEEDFA] hover:bg-[#E0DEFB] px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> Tambah Fitur
                                </button>
                            </div>
                            <div className="space-y-2">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text" value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="e.g. Bebas download source code"
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { const f = [...features]; f.splice(index, 1); setFeatures(f); }}
                                            className="p-2 text-gray-400 hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {features.length === 0 && (
                                    <p className="text-[12px] text-[#8e95a5] font-medium italic text-center py-2">Belum ada fitur ditambahkan.</p>
                                )}
                            </div>
                        </div>

                        {/* Status */}
                        <label className="flex items-center gap-3 cursor-pointer pt-1">
                            <input
                                type="checkbox" checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                            />
                            <span className="text-[13px] font-semibold text-[#1a1a1a]">Paket Aktif <span className="text-[#8e95a5] font-normal">(tampil di halaman pricing)</span></span>
                        </label>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="planForm"
                        disabled={loading}
                        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? "Menyimpan..." : "Simpan Paket"}
                    </button>
                </div>

            </div>
        </div>
    );
}
