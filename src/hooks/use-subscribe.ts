"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Plan {
    id: string;
    name: string;
    slug: string;
    tier: string;
    description: string | null;
    monthlyPrice: number;
    yearlyPrice: number | null;
    isActive: boolean;
    features: string[] | string;
}

export interface ProcessedPlan extends Omit<Plan, 'features'> {
    features: string[];
}

export function useSubscribe() {
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
    const router = useRouter();

    const processPlans = (rawPlans: any[]): ProcessedPlan[] => {
        return rawPlans.map((p: any) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
        }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount).replace("Rp", "");
    };

    const getCurrentPrice = (plan: ProcessedPlan) => {
        return billingCycle === 'YEARLY' && plan.yearlyPrice
            ? Math.floor(plan.yearlyPrice / 12)
            : plan.monthlyPrice;
    };

    const handleSubscribe = async (plan: ProcessedPlan) => {
        toast.info("Mengarahkan ke pembayaran...");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: plan.id,
                    cycle: billingCycle
                })
            });

            const data = await res.json();

            if (res.ok && data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else if (res.status === 401) {
                toast.error("Silakan login terlebih dahulu untuk berlangganan.");
                router.push("/login?callbackUrl=/pricing");
            } else {
                toast.error(data.error || "Gagal memproses langganan.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan.");
        }
    };

    return {
        billingCycle,
        setBillingCycle,
        processPlans,
        formatCurrency,
        getCurrentPrice,
        handleSubscribe,
    };
}
