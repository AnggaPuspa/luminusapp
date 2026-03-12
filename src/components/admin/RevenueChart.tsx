"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from "recharts";

interface ChartDataPoint {
    label: number;
    course: number;
    subscription: number;
}

interface RevenueChartProps {
    data: ChartDataPoint[];
    isYearly: boolean;
    monthNames: string[];
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatRp(value: number) {
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `Rp ${(value / 1_000).toFixed(0)}K`;
    return `Rp ${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const course = payload.find((p: any) => p.dataKey === 'course')?.value || 0;
    const sub    = payload.find((p: any) => p.dataKey === 'subscription')?.value || 0;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-[12px] min-w-[140px]">
            <p className="font-bold text-[#1a1a1a] mb-2 text-[13px]">{label}</p>
            <div className="flex items-center justify-between gap-4 mb-1.5">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4F46E5] inline-block shrink-0" />
                    <span className="text-[#8e95a5]">Kursus</span>
                </div>
                <span className="font-semibold text-[#1a1a1a]">{formatRp(course)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A5B4FC] inline-block shrink-0" />
                    <span className="text-[#8e95a5]">Langganan</span>
                </div>
                <span className="font-semibold text-[#1a1a1a]">{formatRp(sub)}</span>
            </div>
        </div>
    );
}

export default function RevenueChart({ data, isYearly, monthNames }: RevenueChartProps) {
    const formatted = (data || []).map(d => ({
        ...d,
        name: isYearly
            ? MONTH_SHORT[d.label - 1] ?? String(d.label)
            : d.label.toString().padStart(2, '0'),
    }));

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-[17px] font-bold text-[#1a1a1a]">Tren Pendapatan</h2>
                    <p className="text-[#8e95a5] text-[13px] font-medium mt-0.5">Pendapatan Kursus vs Langganan</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
                        <span className="text-[12px] font-medium text-gray-500">Kursus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#A5B4FC]" />
                        <span className="text-[12px] font-medium text-gray-500">Langganan</span>
                    </div>
                </div>
            </div>

            <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={formatted}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCourse" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#A5B4FC" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#A5B4FC" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#8e95a5', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                        />
                        <YAxis
                            tickFormatter={formatRp}
                            tick={{ fontSize: 11, fill: '#8e95a5', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            width={62}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e0e0e0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="subscription"
                            name="Sub"
                            stroke="#A5B4FC"
                            strokeWidth={2}
                            fill="url(#colorSub)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#A5B4FC', strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="course"
                            name="Course"
                            stroke="#4F46E5"
                            strokeWidth={2}
                            fill="url(#colorCourse)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#4F46E5', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
