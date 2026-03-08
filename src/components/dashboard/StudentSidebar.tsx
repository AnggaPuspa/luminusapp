"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    PlayCircle,
    ReceiptText,
    Settings,
    LogOut,
    Sparkles
} from "lucide-react";
import Image from "next/image";

interface SidebarCourse {
    id: string;
    title: string;
    thumbnailUrl: string | null;
}

export default function StudentSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [recentCourses, setRecentCourses] = useState<SidebarCourse[]>([]);

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const res = await fetch("/api/student/overview");
                if (res.ok) {
                    const data = await res.json();
                    setRecentCourses(data.recentCourses || []);
                }
            } catch (error) {
                console.error("Failed to fetch sidebar data", error);
            }
        };
        fetchSidebarData();
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

    const overviewItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Kelas Saya", href: "/dashboard/courses", icon: PlayCircle },
        { label: "Transaksi", href: "/dashboard/transactions", icon: ReceiptText },
    ];

    return (
        <aside className="w-64 bg-white h-full hidden md:flex flex-col shadow-sm border-r border-gray-100 z-20 overflow-y-auto">
            <div className="pt-8 pb-6 px-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#696EFF] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <Link href="/" className="text-xl font-bold text-[#696EFF] uppercase tracking-wide">
                    Luminus
                </Link>
            </div>

            <div className="flex-1 px-8 py-4 space-y-8">
                {/* OVERVIEW SECTION */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Overview</h3>
                    <nav className="space-y-4">
                        {overviewItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-4 transition-colors ${isActive
                                        ? "text-[#696EFF] font-semibold"
                                        : "text-gray-600 hover:text-gray-900 font-medium"
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-[#696EFF]' : 'text-gray-500'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* KELAS AKTIF (FRIENDS REPLACEMENT) */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Kelas Aktif</h3>
                    <div className="space-y-4">
                        {recentCourses.length === 0 ? (
                            <p className="text-sm text-gray-400">Belum ada kelas</p>
                        ) : (
                            recentCourses.map((course) => (
                                <div key={course.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                        {course.thumbnailUrl ? (
                                            <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <PlayCircle className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1 truncate">{course.title}</p>
                                        <p className="text-[10px] text-gray-500 truncate">Lanjutkan Belajar</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SETTINGS SECTION */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Settings</h3>
                    <nav className="space-y-4">
                        <Link
                            href="/dashboard/settings"
                            className={`flex items-center gap-4 transition-colors ${pathname.startsWith('/dashboard/settings') ? 'text-[#696EFF] font-semibold' : 'text-gray-600 hover:text-gray-900 font-medium'}`}
                        >
                            <Settings className={`w-5 h-5 ${pathname.startsWith('/dashboard/settings') ? 'text-[#696EFF]' : 'text-gray-500'}`} />
                            <span>Settings</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 w-full text-[#FF5A5F] hover:text-red-600 font-medium transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>
            </div>
        </aside>
    );
}
