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

    // Features as array of strings
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
                // Reset form
                setName("");
                setTier("MURID");
                setDescription("");
                setMonthlyPrice("");
                setYearlyPrice("");
                setIsActive(true);
                setAllCoursesIncluded(false);
                setAiMentorQuota("0");
                setCommunityInviteUrl("");
                setFeatures([]);
            }
        }
    }, [isOpen, initialData]);

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const handleAddFeature = () => {
        setFeatures([...features, ""]);
    };

    const handleRemoveFeature = (index: number) => {
        const newFeatures = [...features];
        newFeatures.splice(index, 1);
        setFeatures(newFeatures);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            tier,
            description,
            monthlyPrice: parseInt(monthlyPrice) || 0,
            yearlyPrice: yearlyPrice ? parseInt(yearlyPrice) : null,
            isActive,
            allCoursesIncluded,
            aiMentorQuota: parseInt(aiMentorQuota) || 0,
            communityInviteUrl,
            features: features.filter(f => f.trim() !== "") // Remove empty strings
        };

        try {
            const url = initialData ? `/api/admin/plans/${initialData.id}` : `/api/admin/plans`;
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {initialData ? "Edit Paket Langganan" : "Buat Paket Baru"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Atur harga, akses kelas, dan fitur premium.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="planForm" onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Paket</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Paket Murid"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] focus:border-[#A855F7] outline-none text-sm transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tingkat Tier</label>
                                <select
                                    value={tier}
                                    onChange={(e) => setTier(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] focus:border-[#A855F7] outline-none text-sm bg-white"
                                >
                                    <option value="BIASA">Biasa (Basic)</option>
                                    <option value="MURID">Murid (Standard)</option>
                                    <option value="PROFESIONAL">Profesional (Pro)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Singkat</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Cocok untuk mulai belajar coding dari nol"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] focus:border-[#A855F7] outline-none text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Bulanan (Rp) <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={monthlyPrice}
                                    onChange={(e) => setMonthlyPrice(e.target.value)}
                                    placeholder="99000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Tahunan (Rp) (Opsi)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={yearlyPrice}
                                    onChange={(e) => setYearlyPrice(e.target.value)}
                                    placeholder="990000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2">Pengaturan Akses Konten</h3>

                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={allCoursesIncluded}
                                    onChange={(e) => setAllCoursesIncluded(e.target.checked)}
                                    className="w-5 h-5 text-[#A855F7] rounded focus:ring-[#A855F7]"
                                />
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">Buka Semua Kelas (All Access)</p>
                                    <p className="text-xs text-gray-500">Jika dicentang, user bisa mengakses semua course tanpa batas.</p>
                                </div>
                            </label>

                            {!allCoursesIncluded && (
                                <div className="p-3 bg-yellow-50 text-yellow-800 text-xs border border-yellow-200 rounded-lg">
                                    Paket terbatas. Anda harus assign course secara manual setelah paket dibuat.
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Limit AI Mentor Chat / Bulan</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={aiMentorQuota}
                                    onChange={(e) => setAiMentorQuota(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] outline-none text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Ketik 0 jika unlimited (tanpa batas).</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link Invite VIP Community</label>
                                <input
                                    type="url"
                                    value={communityInviteUrl}
                                    onChange={(e) => setCommunityInviteUrl(e.target.value)}
                                    placeholder="https://discord.gg/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3 border-b pb-2">
                                <h3 className="font-bold text-gray-900">List Fitur (Untuk Pricing Page)</h3>
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className="text-xs bg-[#FDF4FF] text-[#A855F7] px-2 py-1 rounded-md font-semibold hover:bg-[#F5D0FE] transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Tambah Fitur
                                </button>
                            </div>

                            <div className="space-y-2">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="e.g. Bebas download source code"
                                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A855F7] outline-none text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(index)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded bg-gray-50 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {features.length === 0 && (
                                    <p className="text-sm text-gray-400 italic text-center py-2">Belum ada fitur ditambahkan.</p>
                                )}
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4 text-[#A855F7] rounded focus:ring-[#A855F7]"
                            />
                            <span className="text-sm font-semibold text-gray-800">Paket Aktif (tampil di halaman form)</span>
                        </label>

                    </form>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="planForm"
                        disabled={loading}
                        className="px-5 py-2 text-sm font-bold text-white bg-[#A855F7] rounded-lg hover:bg-[#9333EA] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Menyimpan..." : "Simpan Paket"}
                    </button>
                </div>
            </div>
        </div>
    );
}
