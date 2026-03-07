"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart3,
    BookOpen,
    Users,
    ShoppingCart,
    Activity,
    LogOut
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
    const navItems = [
        { label: "Dashboard", href: "/admin", icon: BarChart3 },
        { label: "Courses", href: "/admin/courses", icon: BookOpen },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { label: "Webhooks", href: "/admin/webhooks", icon: Activity },
    ];

    return (
        <aside className="w-64 bg-white border-r h-full flex flex-col hidden md:flex">
            <div className="h-16 flex items-center px-6 border-b">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Luminus Admin
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
