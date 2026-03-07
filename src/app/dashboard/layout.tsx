import React from "react";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import StudentTopbar from "@/components/dashboard/StudentTopbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#f1f2f6] overflow-hidden">
            {/* Sidebar Component */}
            <StudentSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar Component */}
                <StudentTopbar />

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
