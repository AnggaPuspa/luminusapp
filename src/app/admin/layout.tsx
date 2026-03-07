import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar Component */}
                <Topbar />

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
