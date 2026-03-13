"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    PlayCircle,
    ReceiptText,
    Settings,
    LogOut,
    Sparkles,
    Bot
} from "lucide-react";
import Image from "next/image";
import { useDashboardOverview } from "@/hooks/use-dashboard";

interface SidebarCourse {
    id: string;
    title: string;
    thumbnailUrl: string | null;
}

export default function StudentSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { stats } = useDashboardOverview();
    const recentCourses: SidebarCourse[] = stats?.recentCourses || [];

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

    const isAiActive = pathname.startsWith('/dashboard/ai-mentor');

    return (
        <aside className="w-64 bg-white h-full hidden md:flex flex-col shadow-sm border-r border-gray-100 z-20 overflow-y-auto">
            <div className="pt-8 pb-6 px-8 flex items-center justify-start gap-3">
                <Link href="/" className="relative w-8 h-8 block hover:opacity-90 transition-opacity flex-shrink-0">
                    <Image 
                        src="/images/logo2.png" 
                        alt="Luminus Logo" 
                        fill 
                        className="object-contain"
                    />
                </Link>
                <Link href="/" className="font-semibold text-2xl text-black hover:opacity-90 transition-opacity">
                    Lu<span className="bg-gradient-to-r from-[#696EFF] to-[#F8ACFF] text-transparent bg-clip-text">minus</span>
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

                {/* KELAS AKTIF */}
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

                {/* AI MENTOR */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">AI Mentor</h3>
                    <nav>
                        <Link
                            href="/dashboard/ai-mentor"
                            className={`flex items-center gap-4 transition-colors ${isAiActive ? 'text-[#696EFF] font-semibold' : 'text-gray-600 hover:text-gray-900 font-medium'}`}
                        >
                            <Bot className={`w-5 h-5 ${isAiActive ? 'text-[#696EFF]' : 'text-gray-500'}`} />
                            <span>Chat AI Mentor</span>
                        </Link>
                    </nav>
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
