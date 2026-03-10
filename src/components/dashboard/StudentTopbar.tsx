"use client";

import { Bell, User } from "lucide-react";
import { useStudentProfile } from "@/hooks/use-dashboard";

export default function StudentTopbar() {
    const { profile } = useStudentProfile();

    return (
        <header className="flex items-center justify-between z-10 w-full">
            <div className="flex items-center flex-1 w-full gap-4">
                {/* Mobile menu button (placeholder) */}
                <button className="md:hidden mr-2 text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Search Bar */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search your course here...."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#696EFF]/20 focus:border-[#696EFF] transition-all placeholder-gray-400 text-gray-700"
                    />
                </div>

                {/* Filter Icon */}
                <button className="p-3 bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl text-gray-400 hover:text-[#696EFF] hover:border-[#696EFF] transition-colors hidden sm:block">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                </button>
            </div>

            {/* Right side items - Profile (visible mostly on mobile or when right sidebar is absent) */}
            <div className="flex items-center gap-4 xl:hidden ml-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative hover:bg-white rounded-full transition-colors border border-gray-200 bg-white">
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    <Bell className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-r from-[#696EFF] to-[#F8ACFF] flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform">
                    {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                </div>
            </div>
        </header>
    );
}

