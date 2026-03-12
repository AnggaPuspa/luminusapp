"use client";

import React, { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

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

    // Function to calculate relative height (max 1000 for standard display or dynamic based on max values)
    const calculateHeights = (paidCount: number, pendingCount: number) => {
        // We will stick to the aesthetic of 1K as max for now.
        // If they ever get more than 1K enrollments per month, visual max drops to 100%. 
        // A dynamic multiplier can be added later if needed.
        const maxVal = 1000;
        const cHeight = Math.min((paidCount / maxVal) * 100, 100);
        const pHeight = Math.min((pendingCount / maxVal) * 100, 100);
        return { cHeight, pHeight };
    };

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

            {/* Chart Area */}
            <div className={`relative h-[280px] transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {/* Y Axis Grid Lines */}
                <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between z-0 pointer-events-none">
                    <div className="w-full flex items-center pl-8"></div>
                    <div className="w-full flex items-center pl-8"></div>
                    {/* Center dotted line */}
                    <div className="w-full flex items-center pl-8 border-b-2 border-indigo-200/50 border-dotted h-0 drop-shadow-sm"></div>
                    <div className="w-full flex items-center pl-8"></div>
                    {/* Bottom solid thin line */}
                    <div className="w-full flex items-center pl-8 border-b border-gray-100 h-0"></div>
                </div>

                {/* Y-Axis Labels (Left) */}
                <div className="absolute left-0 bottom-6 top-0 w-8 flex flex-col justify-between text-[11px] font-medium text-gray-400 pt-1 pointer-events-none">
                    <span>1K</span>
                    <span>800</span>
                    <span>600</span>
                    <span className="relative z-20">400</span>
                    <span>200</span>
                    <span>0</span>
                </div>

                {/* Bar Columns container */}
                <div className="absolute inset-x-0 bottom-6 top-0 ml-10 flex justify-between items-end z-10 px-2 lg:px-4">
                    {chartData.map((d, i) => {
                        const { cHeight, pHeight } = calculateHeights(d.paidCount, d.pendingCount);

                        return (
                            <div key={i} className="flex-1 flex justify-center items-end h-full group relative">
                                {/* Tooltip on Hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute z-30 -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                                    <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] px-4 py-3 border border-gray-50 flex flex-col items-center gap-0.5 whitespace-nowrap">
                                        <span className="text-[14px] font-extrabold text-[#1a1a1a]">{d.paidCount + d.pendingCount} <span className="font-semibold text-gray-600">Pendaftaran</span></span>
                                        <span className="text-[11px] font-medium text-gray-400">{d.monthName}</span>
                                    </div>
                                    <div className="w-3 h-3 bg-white border-b border-r border-gray-50 rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgb(0,0,0,0.02)]"></div>
                                </div>

                                <div className="flex items-end gap-1 md:gap-2 h-[98%] pb-[1px]">
                                    <div className="w-3 md:w-[14px] rounded-full bg-[#4F46E5] hover:opacity-80 transition-opacity" style={{ height: `${cHeight}%` }}></div>
                                    <div className="w-3 md:w-[14px] rounded-full bg-[#374151] hover:opacity-80 transition-opacity" style={{ height: `${pHeight}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* X-Axis Labels (Bottom) */}
                <div className="absolute bottom-0 inset-x-0 ml-10 flex justify-between items-center px-2 lg:px-4 text-[11px] lg:text-[12px] font-medium text-gray-400 pointer-events-none">
                    {chartData.map((m) => (
                        <div key={m.monthName} className={`flex-1 text-center truncate`}>
                            {m.monthName}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
