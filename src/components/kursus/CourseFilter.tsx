"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function CourseFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    
    const handleClearFilter = () => {
        router.push('/kursus');
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white px-5 py-2 rounded-full shadow-[rgba(149,_157,_165,_0.1)_0px_8px_24px] text-black flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
                {searchParams.has('q') ? 'Hapus Filter' : 'Semua'} 
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button 
                        onClick={handleClearFilter}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                        Tampilkan Semua
                    </button>
                    {/* Expandable with actual categories if needed later */}
                </div>
            )}
        </div>
    );
}
