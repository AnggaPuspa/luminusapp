"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    BookOpen,
    Users,
    ShoppingCart,
    CreditCard,
    Award,
    Ticket,
    Webhook,
    LogOut,
    Search,
    Menu,
    ChevronDown,
    BarChart3
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push("/login");
            router.refresh(); // Clear session state from middleware
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    // ONLY REAL DATA/LINKS THAT EXIST IN THE SYSTEM
    const sidebarGroups = [
        {
            title: "MENU UTAMA",
            items: [
                { label: "Dashboard", href: "/admin", icon: Home, exact: true },
                { label: "Kursus", href: "/admin/courses", icon: BookOpen },
                { label: "Pengguna", href: "/admin/users", icon: Users },
            ]
        },
        {
            title: "PENJUALAN & TRANSAKSI",
            items: [
                { label: "Pesanan", href: "/admin/orders", icon: ShoppingCart },
                { label: "Pelanggan", href: "/admin/subscribers", icon: CreditCard },
                { label: "Paket", href: "/admin/plans", icon: Award },
                { label: "Kupon", href: "/admin/coupons", icon: Ticket },
                { label: "Keuangan", href: "/admin/finance", icon: BarChart3 },
            ]
        },
        {
            title: "DEVELOPER TOOLS",
            items: [
                { label: "Webhooks", href: "/admin/webhooks", icon: Webhook },
            ]
        }
    ];

    return (
        <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col hidden md:flex shrink-0 z-20">
            {/* Header / Logo */}
            <div className="h-[84px] flex items-center justify-between px-7 shrink-0 border-b border-gray-50">
                <Link href="/admin" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <img src="/images/logo2.png" alt="Luminus Logo" className="h-[36px] object-contain" />
                    <span className="font-semibold text-2xl text-black">
                        Lu<span className="bg-gradient-to-r from-[#696EFF] to-[#F8ACFF] text-transparent bg-clip-text">minus</span>
                    </span>
                </Link>
                <button className="text-gray-500 hover:text-gray-900 transition-colors">
                    <Menu className="w-6 h-6" strokeWidth={2} />
                </button>
            </div>

            {/* Navigation Lists */}
            <nav className="flex-1 overflow-y-auto px-5 py-5 pb-4 flex flex-col gap-4 custom-scrollbar">
                {sidebarGroups.map((group, index) => (
                    <div key={index}>
                        <p className="text-[10.5px] font-bold tracking-widest text-gray-400 mb-2 px-2 uppercase">
                            {group.title}
                        </p>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = item.exact
                                    ? pathname === item.href
                                    : pathname.startsWith(item.href) && item.href !== "/admin";

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center justify-between px-3.5 py-[9px] rounded-xl transition-all group overflow-hidden ${isActive
                                                ? "bg-[#5552E9] text-white shadow-sm font-medium"
                                                : "text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon
                                                    className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"} transition-colors`}
                                                    strokeWidth={1.5}
                                                />
                                                <span className="text-[14px] truncate">{item.label}</span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {/* Adding the Log Out button directly into the Settings section styling to match reference image */}
                <div className="mt-auto pt-2">
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between px-3.5 py-[9px] rounded-xl transition-all group overflow-hidden text-[#6B7280] font-medium hover:bg-red-50 hover:text-red-600"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut
                                        className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors"
                                        strokeWidth={1.5}
                                    />
                                    <span className="text-[14px]">Log Out</span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>
    );
}
