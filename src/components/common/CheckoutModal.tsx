"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { invalidateDashboard } from "@/hooks/use-dashboard";

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    title: string;
    originalPrice: number;
    discountedPrice: number | null;
}

export default function CheckoutModal({
    isOpen,
    onClose,
    courseId,
    title,
    originalPrice,
    discountedPrice
}: CheckoutModalProps) {
    const router = useRouter();

    // Pricing state
    const basePrice = discountedPrice !== null ? discountedPrice : originalPrice;
    const [finalPrice, setFinalPrice] = useState(basePrice);

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

    // Checkout state
    const [isProcessing, setIsProcessing] = useState(false);

    // Portal state to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);

        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, courseId })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Kupon tidak valid");
                return;
            }

            setAppliedCoupon({
                code: couponCode.toUpperCase(),
                discountAmount: data.discountAmount,
                id: data.couponId
            });
            setFinalPrice(data.finalPrice);
            toast.success("Kupon berhasil diterapkan!");

        } catch (error) {
            console.error("Error validating coupon:", error);
            toast.error("Terjadi kesalahan saat memvalidasi kupon");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setFinalPrice(basePrice);
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const payload = {
                courseId,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined
            };

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?redirect=checkout");
                    return;
                }
                throw new Error(data.message || "Checkout gagal");
            }

            // Invalidate SWR cache so dashboard shows new enrollment immediately
            invalidateDashboard();

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else if (data.redirectUrl) {
                router.push(data.redirectUrl);
            }
        } catch (error: any) {
            console.error("Error during checkout:", error);
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-2xl">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#696EFF] p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <h2 className="text-[length:var(--descText)] font-bold mb-1">Rincian Pembayaran</h2>
                    <p className="text-blue-100 opacity-90">Selesaikan pembayaran untuk mulai belajar</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Item Summary */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="font-semibold text-gray-500 tracking-wider mb-2">Item</p>
                        <h3 className="font-bold text-gray-900 leading-snug">{title}</h3>

                        <div className="mt-4 flex justify-between items-end">
                            <span className="text-gray-500">Harga Dasar</span>
                            <div className="text-right">
                                {discountedPrice !== null && (
                                    <span className="block line-through text-gray-400">
                                        {formatPrice(originalPrice)}
                                    </span>
                                )}
                                <span className="font-semibold text-gray-800">
                                    {formatPrice(basePrice)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Coupon Input */}
                    <div>
                        <p className="font-semibold text-gray-700 mb-2">Punya Kode Promo?</p>

                        {!appliedCoupon ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Masukkan kode kupon..."
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#696EFF]/50 focus:border-[#696EFF] outline-none transition uppercase font-mono"
                                    disabled={isApplyingCoupon}
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode.trim() || isApplyingCoupon}
                                    className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition disabled:opacity-50 min-w-[90px]"
                                >
                                    {isApplyingCoupon ? 'Cek...' : 'Terapkan'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700">
                                    <i className="fa-solid fa-tags"></i>
                                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                                </div>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-gray-400 hover:text-red-500 transition flex items-center gap-1"
                                >
                                    <i className="fa-regular fa-circle-xmark"></i> Hapus
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Total Summary */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        {appliedCoupon && (
                            <div className="flex justify-between items-center text-green-600 font-medium">
                                <span>Diskon Promo</span>
                                <span>- {formatPrice(appliedCoupon.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-gray-200">
                            <span className="font-bold text-gray-900 border-b">Total Bayar</span>
                            {finalPrice === 0 ? (
                                <span className="font-black text-green-600">GRATIS</span>
                            ) : (
                                <span className="font-black text-[#696EFF]">{formatPrice(finalPrice)}</span>
                            )}
                        </div>
                    </div>

                    {/* Pay Action */}
                    <button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl bg-[#696EFF] hover:bg-blue-700 text-white font-bold transition shadow-lg shadow-blue-200/50 flex justify-center items-center"
                    >
                        {isProcessing ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div> Memproses...</>
                        ) : finalPrice === 0 ? "Dapatkan Kelas Gratis" : "Lanjutkan ke Pembayaran"}
                    </button>

                    <p className="text-center text-[14px] text-gray-400 mt-4">
                        <i className="fa-solid fa-lock mr-1"></i> Pembayaran aman diproses oleh Mayar
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
}
