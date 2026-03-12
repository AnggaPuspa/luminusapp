"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Zap, ShoppingBag, Power, ChevronDown, SquareArrowOutUpRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface AdminUser {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
}

export default function Topbar({ adminUser }: { adminUser: AdminUser }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    const getPageTitle = () => {
        if (!pathname) return "Dashboard";
        if (pathname === "/admin") return "Dashboard";
        if (pathname.includes("/admin/courses")) return "Courses Management";
        if (pathname.includes("/admin/users")) return "User Management";
        if (pathname.includes("/admin/orders")) return "Orders & Transactions";
        if (pathname.includes("/admin/subscribers")) return "Subscribers";
        if (pathname.includes("/admin/plans")) return "Subscription Plans";
        if (pathname.includes("/admin/coupons")) return "Coupons";
        if (pathname.includes("/admin/webhooks")) return "Webhooks";
        return "Admin Area";
    };

    return (
        <div className="px-6 md:px-8 pt-6 md:pt-8 bg-gray-50 w-full z-10 shrink-0">
            <header className="h-[84px] bg-white rounded-[20px] shadow-sm flex items-center justify-between px-7 mx-auto max-w-[1600px] border border-gray-100/50">
                {/* Left Section: Title */}
                <div>
                    <h1 className="text-[17px] font-extrabold text-[#1a1a1a]">{getPageTitle()}</h1>
                    <p className="text-[12px] font-medium text-gray-400 mt-0.5">Welcome back, {adminUser?.name || 'Admin'}</p>
                </div>

                {/* Right Section: Tools & Profile */}
                <div className="flex items-center gap-7">

                    {/* Action Icons */}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => window.open("/", "_blank")}
                            className="w-[40px] h-[40px] flex items-center justify-center text-gray-400 hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-full transition-all duration-300 tooltip-trigger relative group"
                            title="View Live Website"
                        >
                            <Globe className="w-5 h-5" strokeWidth={1.75} />
                        </button>

                        <button 
                            onClick={() => router.push("/admin/courses")}
                            className="w-[40px] h-[40px] flex items-center justify-center text-gray-400 hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-full transition-all duration-300"
                            title="Quick Add Course"
                        >
                            <Zap className="w-5 h-5" strokeWidth={1.75} />
                        </button>

                        <button 
                            onClick={() => router.push("/admin/orders")}
                            className="w-[40px] h-[40px] flex items-center justify-center text-gray-400 hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-full transition-all duration-300"
                            title="View Orders"
                        >
                            <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                        </button>

                        <button 
                            onClick={handleLogout}
                            className="w-[40px] h-[40px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                            title="Logout"
                        >
                            <Power className="w-5 h-5" strokeWidth={1.75} />
                        </button>
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px h-8 bg-gray-100"></div>

                    {/* User Profile */}
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="w-[42px] h-[42px] rounded-full bg-[#8B5CF6] flex items-center justify-center overflow-hidden border border-gray-50 shadow-sm relative">
                                {adminUser?.avatarUrl ? (
                                    <Image src={adminUser.avatarUrl} alt={adminUser.name} fill className="object-cover" sizes="42px" />
                                ) : (
                                    <img
                                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(adminUser?.name || 'Admin')}&backgroundColor=transparent`}
                                        alt={adminUser?.name || 'Admin'}
                                        className="w-12 h-12 object-cover translate-y-1.5"
                                    />
                                )}
                            </div>
                            <div className="flex flex-col text-left mr-1 hidden sm:flex">
                                <span className="text-[14px] font-extrabold text-[#1a1a1a] leading-tight max-w-[120px] truncate">
                                    {adminUser?.name || 'Admin User'}
                                </span>
                                <span className="text-[12px] font-medium text-gray-400 mt-0.5 capitalize">{adminUser?.role?.toLowerCase() || 'admin'}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                    <p className="text-[14px] font-semibold text-[#1a1a1a] truncate">{adminUser?.name || 'Admin User'}</p>
                                    <p className="text-[12px] font-medium text-gray-400 truncate mt-0.5">{adminUser?.email || 'admin@admin.com'}</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            window.open("/", "_blank");
                                        }}
                                        className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#1a1a1a] rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <SquareArrowOutUpRight className="w-4 h-4 text-gray-400" />
                                        View Live Website
                                    </button>
                                </div>
                                <div className="p-2 border-t border-gray-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Power className="w-4 h-4 text-red-500" />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </header>
        </div>
    );
}
