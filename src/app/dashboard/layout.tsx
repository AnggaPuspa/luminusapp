import React from "react";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"]
});

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`flex h-screen bg-[#FAFAFA] overflow-hidden ${poppins.className}`}>
            {/* Sidebar Component */}
            <StudentSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
