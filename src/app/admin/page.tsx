"use client";

import React, { useEffect, useState } from "react";
import {
    BanknotesIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ShoppingCartIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalStudents: 0,
        publishedCourses: 0,
        recentOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await fetch("/api/admin/overview");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard overview", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {loading ? "..." : `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
                            </p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <BanknotesIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {loading ? "..." : stats.totalStudents}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <UserGroupIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">Published Courses</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {loading ? "..." : stats.publishedCourses}
                            </p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">Recent Orders (7d)</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {loading ? "..." : stats.recentOrders}
                            </p>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <ShoppingCartIcon className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
