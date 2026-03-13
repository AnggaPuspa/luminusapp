"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PromoPopupProps {
    promo: {
        id: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        promoCode: string | null;
        ctaText: string | null;
        ctaUrl: string | null;
    } | null;
}

export default function PromoPopup({ promo }: PromoPopupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!promo) return;

        const dismissedKey = `promo_dismissed_${promo.id}`;
        const hasDismissedInSession = sessionStorage.getItem(dismissedKey);

        if (hasDismissedInSession) {
            return; // Jangan tampilkan jika sudah ditutup dalam sesi ini (tab yang sama)
        }

        // Delay popup appearance by 2.5 seconds for better UX
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, [promo]);

    const handleClose = () => {
        setIsOpen(false);
        if (promo) {
            sessionStorage.setItem(`promo_dismissed_${promo.id}`, "true");
        }
    };

    const handleCopyCode = async () => {
        if (!promo?.promoCode) return;
        try {
            await navigator.clipboard.writeText(promo.promoCode);
            setIsCopied(true);
            toast.success("Kode promo disalin!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Gagal menyalin kode");
        }
    };

    if (!isMounted || !isOpen || !promo) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-[850px] animate-in zoom-in-95 duration-500 ease-out">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-4 -right-4 md:-top-5 md:-right-5 z-[110] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 rounded-full shadow-xl transition-all"
                    title="Tutup promo"
                >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Modal Wrapper using Native Border Radius styling */}
                <div className="bg-white rounded-[24px] shadow-2xl w-full flex flex-col md:flex-row overflow-hidden relative">
                    
                    {/* Banner Image */}
                    {promo.imageUrl && (
                        <div className="relative w-full md:w-[45%] h-[240px] sm:h-[300px] md:h-auto bg-[#0A0B1A] shrink-0 border-b md:border-b-0 md:border-r border-gray-100 flex items-center justify-center overflow-hidden">
                            <Image
                                src={promo.imageUrl}
                                alt={promo.title}
                                fill
                                className="object-cover object-center md:scale-105"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className={`p-6 md:p-8 lg:px-12 lg:py-8 flex flex-col justify-center items-center text-center ${promo.imageUrl ? 'w-full md:w-[55%]' : 'w-full'}`}>
                        <h2 className="text-[18px] md:text-[20px] lg:text-[22px] font-extrabold text-blue-primary mb-2 leading-tight tracking-tight">
                            {promo.title}
                        </h2>
                        
                        {promo.description && (
                            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed max-w-[95%]">
                                {promo.description}
                            </p>
                        )}

                        {/* Promo Code Ticket */}
                        {promo.promoCode && (
                            <div className="w-full flex justify-center mb-6">
                                <div
                                    onClick={handleCopyCode}
                                    className="relative w-full max-w-[280px] border-2 border-dashed border-gradient-1 bg-white/50 rounded-2xl py-4 px-6 flex flex-col items-center justify-center cursor-pointer group hover:bg-[#F1F5FC] transition-colors"
                                >
                                    {/* Cutouts */}
                                    <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white z-10 transition-colors group-hover:bg-[#F1F5FC]"></div>
                                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white z-10 transition-colors group-hover:bg-[#F1F5FC]"></div>
                                    
                                    <span className="text-[12px] font-bold text-gradient-1 uppercase tracking-wider mb-1.5 z-20">
                                        Kode Promo
                                    </span>
                                    <div className="flex items-center gap-2 z-20">
                                        <span className="text-[20px] md:text-[24px] font-bold text-gradient-1 tracking-[0.1em]">
                                            {promo.promoCode}
                                        </span>
                                        {isCopied && (
                                            <div className="absolute -top-3 -right-3 bg-white rounded-full shadow-sm">
                                                <CheckCircle2 className="w-6 h-6 text-gradient-1" />
                                            </div>
                                        )}
                                        <Copy className="absolute top-4 right-4 w-4 h-4 text-gradient-1/40 group-hover:text-gradient-1 transition-colors opacity-0 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CTA Button Using Web Design Native Gradients */}
                        {promo.ctaUrl ? (
                            <Link
                                href={promo.ctaUrl}
                                onClick={handleClose}
                                className="w-full max-w-[320px] text-center px-6 py-3.5 md:py-[18px] rounded-[15px] font-semibold text-white text-[15px] md:text-[16px] bg-gradient-to-r from-gradient-1 to-gradient-2 shadow-[0_8px_17px_0px_rgba(105,110,255,0.25)] transition-all hover:opacity-90 active:translate-y-0"
                            >
                                {promo.ctaText || "Tukarkan Sekarang"}
                            </Link>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="w-full max-w-[320px] text-center px-6 py-3.5 md:py-[18px] rounded-[15px] font-semibold text-white text-[15px] md:text-[16px] bg-gradient-to-r from-gradient-1 to-gradient-2 shadow-[0_8px_17px_0px_rgba(105,110,255,0.25)] transition-all hover:opacity-90 active:translate-y-0"
                            >
                                {promo.ctaText || "Tutup"}
                            </button>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
