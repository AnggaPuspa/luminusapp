import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { verifySession } from "@/lib/auth";
import { getAdminProfile } from "@/services/admin.service";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await verifySession();
    if (!session || !session.user) {
        redirect("/login");
    }

    const adminProfile = await getAdminProfile(session.user.id);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar Component */}
                <Topbar adminUser={adminProfile || session.user} />

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
