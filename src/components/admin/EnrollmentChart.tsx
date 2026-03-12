"use client";

import React, { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyActivity {
    monthName: string;
    paidCount: number;
    pendingCount: number;
}

interface EnrollmentChartProps {
    availableYears: number[];
    initialData: MonthlyActivity[];
    initialYear: number;
}

export function EnrollmentChart({ availableYears, initialData, initialYear }: EnrollmentChartProps) {
    const [selectedYear, setSelectedYear] = useState<number>(initialYear);
    const [chartData, setChartData] = useState<MonthlyActivity[]>(initialData);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // Skip fetching if the selected year is the initial year upon first render
        if (selectedYear === initialYear && chartData === initialData) {
            return;
        }

        const fetchYearlyData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/admin/enrollment-activity?year=${selectedYear}`);
                if (res.ok) {
                    const data = await res.json();
                    setChartData(data);
                } else {
                    console.error("Failed to fetch enrollment data");
                }
            } catch (error) {
                console.error("Error fetching enrollment activity:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchYearlyData();
    }, [selectedYear, initialYear, initialData]); // chartData removed from deps to prevent infinite loop

    return (
        <div className="bg-white rounded-2xl p-7 pt-6 shadow-sm">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-[17px] font-bold text-[#1a1a1a]">Aktivitas Pendaftaran</h2>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span>
                        <span className="text-[13px] font-semibold text-gray-500">Lunas/Aktif</span>
                    </div>
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#374151]"></span>
                        <span className="text-[13px] font-semibold text-gray-500">Pending</span>
                    </div>
                    <div className="ml-0 sm:ml-4 flex items-center gap-2 relative z-50">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                            className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-gray-600 outline-none hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                            <MoreHorizontal className="w-[18px] h-[18px] pointer-events-none" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart Area using Recharts */}
            <div className={`relative w-full h-[280px] transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        barGap={4}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis 
                            dataKey="monthName" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                            dx={-10}
                        />
                        <Tooltip 
                            cursor={{ fill: '#F9FAFB' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
                                    const monthName = payload[0].payload.monthName;
                                    return (
                                        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] px-4 py-3 border border-gray-50 flex flex-col items-center gap-0.5 whitespace-nowrap z-50 relative">
                                            <span className="text-[14px] font-extrabold text-[#1a1a1a]">
                                                {total} <span className="font-semibold text-gray-600">Pendaftaran</span>
                                            </span>
                                            <span className="text-[11px] font-medium text-gray-400">{monthName}</span>
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-50 rotate-45 shadow-[2px_2px_4px_rgb(0,0,0,0.02)]"></div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar 
                            dataKey="paidCount" 
                            fill="#4F46E5" 
                            radius={[4, 4, 0, 0]} 
                            barSize={12}
                        />
                        <Bar 
                            dataKey="pendingCount" 
                            fill="#374151" 
                            radius={[4, 4, 0, 0]} 
                            barSize={12}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
