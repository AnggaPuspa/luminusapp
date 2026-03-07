"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
    courseId: string;
    className?: string;
    children?: React.ReactNode;
}

export default function CheckoutButton({ courseId, className, children }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });

            const data = await res.json();

            if (!res.ok) {
                // If unauthorized, redirect to login
                if (res.status === 401) {
                    router.push("/login?redirect=checkout");
                    return;
                }
                throw new Error(data.message || "Checkout failed");
            }

            // Redirect to Mayar Payment URL, or to the course if it's free
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else if (data.redirectUrl) {
                router.push(data.redirectUrl);
            }
        } catch (error: any) {
            console.error("Error during checkout:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={`transition-all ${className || "px-6 py-3 font-medium rounded-lg bg-[#696EFF] text-white hover:bg-blue-700 disabled:opacity-70"}`}
        >
            {loading ? "Memproses..." : (children || "Beli Kursus")}
        </button>
    );
}
