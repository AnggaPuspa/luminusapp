"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RevenueSplitProps {
    courseRevenue: number;
    subscriptionRevenue: number;
}

function formatRp(value: number) {
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `Rp ${(value / 1_000).toFixed(0)}K`;
    return `Rp ${value}`;
}

export default function RevenueSplit({ courseRevenue, subscriptionRevenue }: RevenueSplitProps) {
    const total = courseRevenue + subscriptionRevenue;
    
    const coursePercent = total > 0 ? Math.round((courseRevenue / total) * 100) : 0;
    const subPercent = total > 0 ? Math.round((subscriptionRevenue / total) * 100) : 0;

    const data = [
        { name: 'Kursus', value: courseRevenue, color: '#4F46E5', percent: coursePercent },
        { name: 'Langganan', value: subscriptionRevenue, color: '#A5B4FC', percent: subPercent },
    ];

    return (
        <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-[17px] font-bold text-[#1a1a1a] mb-4">Komposisi Pendapatan</h2>
            
            <div className="flex-1 flex flex-col">
                {total === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[#8e95a5] text-[13px] font-medium">
                        Belum ada data revenue
                    </div>
                ) : (
                    <>
                        <div className="relative w-full h-[150px] mb-4 flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[11px] font-bold text-[#8e95a5] tracking-wider mb-0.5">TOTAL</span>
                                <span className="text-[15px] font-bold text-[#1a1a1a]">{formatRp(total)}</span>
                            </div>
                        </div>

                        <div className="w-full space-y-2 mt-auto">
                            {data.map((item, i) => (
                                <div 
                                    key={item.name}
                                    className="flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-200 border border-transparent hover:bg-gray-50/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[13px] font-semibold text-gray-700">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[13px] font-bold text-[#1a1a1a]">{formatRp(item.value)}</span>
                                        <span className="text-[12px] font-bold text-[#4F46E5] bg-[#EEEDFA] px-2 py-0.5 rounded-md min-w-[44px] text-center">
                                            {item.percent}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
