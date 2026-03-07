"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckoutModal from "./CheckoutModal";

interface CheckoutButtonProps {
    courseId: string;
    title?: string;
    originalPrice?: number;
    discountedPrice?: number | null;
    className?: string;
    children?: React.ReactNode;
}

export default function CheckoutButton({
    courseId,
    title = "Kursus",
    originalPrice = 0,
    discountedPrice = null,
    className,
    children
}: CheckoutButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleClick = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={`transition-all ${className || "px-6 py-3 font-medium rounded-lg bg-[#696EFF] text-white hover:bg-blue-700"}`}
            >
                {children || "Beli Kursus"}
            </button>
            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                courseId={courseId}
                title={title}
                originalPrice={originalPrice}
                discountedPrice={discountedPrice}
            />
        </>
    );
}
