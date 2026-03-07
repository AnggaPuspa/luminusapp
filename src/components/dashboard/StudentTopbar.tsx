"use client";

import { Bell, User } from "lucide-react";

export default function StudentTopbar() {
    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 lg:px-8 shadow-sm z-10">
            <div className="flex items-center flex-1">
                {/* Mobile menu button (placeholder) */}
                <button className="md:hidden mr-4 text-gray-500 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    <Bell className="w-5 h-5" />
                </button>

                {/* User Profile Placeholder */}
                <div className="flex items-center gap-3 border-l pl-4 ml-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
