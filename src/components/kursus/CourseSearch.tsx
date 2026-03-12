"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function CourseSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);

    // Sync input when URL changes (e.g., clicking a tag)
    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
            params.set('q', query.trim());
        } else {
            params.delete('q');
        }
        
        // Push the new URL
        router.push(`/kursus?${params.toString()}`);
    };

    const handleTagClick = (tag: string) => {
        setQuery(tag);
        // We directly push to be faster, handleSearch would use old state
        const params = new URLSearchParams(searchParams.toString());
        params.set('q', tag);
        router.push(`/kursus?${params.toString()}`);
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSearch} className="flex bg-white rounded-xl p-[6px] max-w-[450px] w-full mb-6 relative mt-8 shadow-sm">
                <input
                    type="text"
                    placeholder="Cari kursus (misal: React, Laravel)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 outline-none px-4 text-black font-normal placeholder:opacity-50"
                />
                <button type="submit" className="bg-gradient-to-r from-gradient-1 to-gradient-2 w-12 h-10 rounded-lg flex justify-center items-center text-white hover:opacity-90 transition-opacity">
                    <Search className="w-5 h-5" />
                </button>
            </form>

            <div className="flex flex-wrap items-center gap-3 text-white">
                <span className="opacity-70">Rekomendasi:</span>
                <div className="flex gap-4">
                    {['Struktur Data', 'Algoritma', 'Laravel'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className="opacity-70 hover:opacity-100 underline transition-opacity"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
