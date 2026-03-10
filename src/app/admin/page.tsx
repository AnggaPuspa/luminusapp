"use client";

import React, { useEffect, useState } from "react";
import {
    MoreHorizontal, ArrowUpRight, ArrowDownRight,
    RefreshCw, Calendar, Filter,
    CheckCircle2, XCircle, Clock,
    User, Check
} from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* NOTE FOR BACKEND TEAM: 
                Semua data di halaman ini adalah DUMMY (hardcoded UI) namun konten sudah di-sesuaikan
                dengan model bisnis Luminus (Platform Kursus Online/E-Learning).
                Harap di-mapping ulang ke API Prisma: 
                - Tabel Transaction = Graph Enrollment Activity & Latest Enrollments
                - Total Users role STUDENT = Product Views / Active Students
                - CourseReview = Recent Reviews
                - Top Enrollments = Most Popular Courses (Bar hijau)
            */}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column (Main Content) */}
                <div className="xl:col-span-8 space-y-6">

                    {/* Top Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Earnings */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-transparent hover:border-gray-50 transition-colors">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-semibold mb-1 uppercase tracking-wider">Total Revenue</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-1.5">Rp 45.2M</p>
                                <p className="text-[#84C529] font-bold text-[12px] flex items-center bg-[#84C529]/10 w-fit px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> +15%
                                </p>
                            </div>
                            <div className="relative w-14 h-14 rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-45 shrink-0"></div>
                        </div>

                        {/* Number of Sales */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-transparent hover:border-gray-50 transition-colors">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-semibold mb-1 uppercase tracking-wider">Total Enrollments</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-1.5">3,847</p>
                                <p className="text-[#ef4444] font-bold text-[12px] flex items-center bg-[#ef4444]/10 w-fit px-1.5 py-0.5 rounded">
                                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> -4.5%
                                </p>
                            </div>
                            <div className="relative w-14 h-14 rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 border-b-gray-100 rotate-[-15deg] shrink-0"></div>
                        </div>

                        {/* Product Views */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-transparent hover:border-gray-50 transition-colors">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-semibold mb-1 uppercase tracking-wider">Active Students</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-1.5">12,756</p>
                                <p className="text-[#84C529] font-bold text-[12px] flex items-center bg-[#84C529]/10 w-fit px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> +5%
                                </p>
                            </div>
                            <div className="relative w-14 h-14 rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 rotate-[130deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Purchase Activity Chart -> Enrollment Activity */}
                    <div className="bg-white rounded-2xl p-7 pt-6 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-[17px] font-bold text-[#1a1a1a]">Enrollment Activity</h2>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span>
                                    <span className="text-[13px] font-semibold text-gray-500">Paid/Active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#374151]"></span>
                                    <span className="text-[13px] font-semibold text-gray-500">Pending</span>
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                    <select className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-gray-600 outline-none hover:bg-gray-100 transition-colors cursor-pointer">
                                        <option>2023</option>
                                        <option>2024</option>
                                    </select>
                                    <button className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                                        <MoreHorizontal className="w-[18px] h-[18px] pointer-events-none" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="relative h-[280px]">
                            {/* Y Axis Grid Lines */}
                            <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between z-0">
                                <div className="w-full flex items-center pl-8"></div>
                                <div className="w-full flex items-center pl-8"></div>
                                {/* Center dotted line */}
                                <div className="w-full flex items-center pl-8 border-b-2 border-indigo-200/50 border-dotted h-0 drop-shadow-sm"></div>
                                <div className="w-full flex items-center pl-8"></div>
                                {/* Bottom solid thin line */}
                                <div className="w-full flex items-center pl-8 border-b border-gray-100 h-0"></div>
                            </div>

                            {/* Y-Axis Labels (Left) */}
                            <div className="absolute left-0 bottom-6 top-0 w-8 flex flex-col justify-between text-[11px] font-medium text-gray-400 pt-1">
                                <span>1K</span>
                                <span>800</span>
                                <span>600</span>
                                <span className="relative z-20">400</span>
                                <span>200</span>
                                <span>0</span>
                            </div>

                            {/* Tooltip Overlay Mock */}
                            <div className="absolute z-30 left-[39%] top-[30%] -translate-y-full flex flex-col items-center">
                                <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] px-4 py-3 border border-gray-50 flex flex-col items-center gap-0.5">
                                    <span className="text-[14px] font-extrabold text-[#1a1a1a]">846 <span className="font-semibold text-gray-600">Enrollments</span></span>
                                    <span className="text-[11px] font-medium text-gray-400">June 2023</span>
                                </div>
                                <div className="w-3 h-3 bg-white border-b border-r border-gray-50 rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgb(0,0,0,0.02)]"></div>
                            </div>

                            {/* Bar Columns container */}
                            <div className="absolute inset-x-0 bottom-6 top-0 ml-10 flex justify-between items-end z-10 px-2 lg:px-4">
                                {[
                                    { month: 'January', c: 90, p: 50 },
                                    { month: 'February', c: 50, p: 30 },
                                    { month: 'March', c: 75, p: 50 },
                                    { month: 'April', c: 80, p: 30 },
                                    { month: 'May', c: 85, p: 15 },
                                    { month: 'June', c: 55, p: 50 }, // Lowered blue bar to let tooltip show clearly
                                    { month: 'July', c: 95, p: 35 },
                                    { month: 'August', c: 60, p: 10 },
                                    { month: 'September', c: 100, p: 65 },
                                    { month: 'October', c: 90, p: 70 },
                                    { month: 'November', c: 85, p: 80 },
                                    { month: 'December', c: 80, p: 35 },
                                ].map((d, i) => (
                                    <div key={i} className="flex-1 flex justify-center items-end h-full">
                                        <div className="flex items-end gap-1 md:gap-2 h-[98%] pb-[1px]">
                                            <div className="w-3 md:w-[14px] rounded-full bg-[#4F46E5] hover:opacity-80 transition-opacity" style={{ height: `${d.c}%` }}></div>
                                            <div className="w-3 md:w-[14px] rounded-full bg-[#374151] hover:opacity-80 transition-opacity" style={{ height: `${d.p}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* X-Axis Labels (Bottom) */}
                            <div className="absolute bottom-0 inset-x-0 ml-10 flex justify-between items-center px-2 lg:px-4 text-[11px] lg:text-[12px] font-medium text-gray-400">
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                                    <div key={m} className={`flex-1 text-center truncate ${m === 'June' ? '' : ''}`}>
                                        {m}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Latest Transactions -> Latest Enrollments */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                        <div className="p-6 pb-5 flex justify-between items-center border-b border-gray-100">
                            <h2 className="text-[17px] font-bold text-[#1a1a1a]">Latest Enrollments</h2>
                            <div className="flex gap-2">
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><RefreshCw className="w-[18px] h-[18px]" strokeWidth={2} /></button>
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><Calendar className="w-[18px] h-[18px]" strokeWidth={2} /></button>
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><Filter className="w-[18px] h-[18px]" strokeWidth={2} /></button>
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} /></button>
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                                    <tr>
                                        <th className="px-4 py-4 w-12 text-center align-middle"><input type="checkbox" className="w-[16px] h-[16px] rounded-[4px] border-gray-300 text-indigo-600 focus:ring-indigo-600 align-middle" /></th>
                                        <th className="px-3 py-4 font-normal">Course Name</th>
                                        <th className="px-3 py-4 font-normal">Transaction ID</th>
                                        <th className="px-3 py-4 font-normal">Date</th>
                                        <th className="px-3 py-4 font-normal">Amount</th>
                                        <th className="px-3 py-4 font-normal">Status</th>
                                        <th className="px-3 py-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { product: 'Mastering Next.js 14', cat: 'Web Development', id: 'TRX-101-123456', date: 'Dec 12, 2023', amount: 'Rp 650K', status: 'Completed', color: 'bg-[#F0FDF4] text-[#22C55E]', icon: <CheckCircle2 className="w-3.5 h-3.5 fill-[#22c55e] text-white" />, imgBg: 'bg-[#18181B]', checked: true },
                                        { product: 'UI/UX Design Masterclass', cat: 'Design', id: 'TRX-102-123456', date: 'Dec 10, 2023', amount: 'Rp 450K', status: 'Canceled', color: 'bg-[#FEF2F2] text-[#EF4444]', icon: <XCircle className="w-3.5 h-3.5 fill-[#ef4444] text-white" />, imgBg: 'bg-[#93C5FD]', checked: false },
                                        { product: 'Golang Backend Architecture', cat: 'Backend', id: 'TRX-103-123456', date: 'Dec 8, 2023', amount: 'Rp 850K', status: 'Pending', color: 'bg-[#F3F4F6] text-[#4B5563]', icon: <Clock className="w-3 h-3 text-gray-500" strokeWidth={2.5} />, imgBg: 'bg-[#0EA5E9]', checked: false },
                                        { product: 'Pro Plan Subscription (1 Yr)', cat: 'Subscription', id: 'SUB-004-123456', date: 'Dec 7, 2023', amount: 'Rp 1.2M', status: 'Completed', color: 'bg-[#F0FDF4] text-[#22C55E]', icon: <CheckCircle2 className="w-3.5 h-3.5 fill-[#22c55e] text-white" />, imgBg: 'bg-[#F59E0B]', checked: false },
                                        { product: 'Figma to Code React', cat: 'Frontend', id: 'TRX-105-123456', date: 'Dec 6, 2023', amount: 'Rp 350K', status: 'Completed', color: 'bg-[#F0FDF4] text-[#22C55E]', icon: <CheckCircle2 className="w-3.5 h-3.5 fill-[#22c55e] text-white" />, imgBg: 'bg-[#8B5CF6]', checked: false },
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                            {/* We use a wrapper div inside TD to create the continuous border/background effect for rows without border-bottom on TR */}
                                            <td className="p-0 relative">
                                                {row.checked && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4F46E5]"></div>
                                                )}
                                                <div className="h-[64px] flex items-center justify-center px-4 transition-colors">
                                                    {row.checked ? (
                                                        <div className="w-[16px] h-[16px] rounded-[4px] bg-[#4F46E5] flex items-center justify-center cursor-pointer shadow-sm">
                                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                                                        </div>
                                                    ) : (
                                                        <input type="checkbox" className="w-[16px] h-[16px] rounded-[4px] border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3`}>
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-[32px] h-[32px] rounded-lg shadow-sm shrink-0 ${row.imgBg}`}></div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-[#1a1a1a] text-[13.5px] whitespace-nowrap leading-tight">{row.product}</p>
                                                            <p className="text-[12px] text-[#8e95a5] mt-0.5 whitespace-nowrap leading-tight">{row.cat}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 text-gray-500 font-medium text-[13px] whitespace-nowrap`}>{row.id}</div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 text-[#8e95a5] text-[13px] font-medium whitespace-nowrap`}>{row.date}</div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 font-semibold text-[#1a1a1a] text-[13.5px] whitespace-nowrap`}>{row.amount}</div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 overflow-hidden`}>
                                                    <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] whitespace-nowrap font-semibold ${row.color}`}>
                                                        {row.icon}
                                                        {row.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 justify-end pr-5`}>
                                                    <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full transition-colors hover:bg-gray-100">
                                                        <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="p-5 px-6 pt-2 flex items-center justify-between text-[13px] text-gray-500">
                            <p>Showing <span className="font-semibold text-[#1a1a1a]">1-5</span> from <span className="font-semibold text-[#1a1a1a]">320</span> data</p>
                            <div className="flex gap-1 items-center">
                                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md">&lt;</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#4F46E5] text-white font-semibold shadow-sm">1</button>
                                {[2, 3, 4, 5].map(p => (
                                    <button key={p} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors">{p}</button>
                                ))}
                                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md">&gt;</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="xl:col-span-4 bg-white rounded-2xl p-7 lg:p-8 shadow-sm h-fit">

                    {/* Balance Card Section */}
                    <div className="mb-9">
                        <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-5">Balance</h3>
                        <div className="bg-[#5964E0] rounded-2xl p-6 text-white relative overflow-hidden group">
                            <p className="text-[#a5abf0] text-[13px] font-medium mb-1.5">Total Balance</p>
                            <div className="absolute top-5 right-5">
                                <button className="p-1 rounded border border-white/20 text-white/80 hover:bg-white/10 transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                            <h2 className="text-[28px] font-bold tracking-tight mb-7 drop-shadow-sm">Rp 125M</h2>

                            {/* Card bottom section (lighter blue) */}
                            <div className="absolute bottom-0 inset-x-0 h-14 bg-[#6c76e2] flex justify-between items-center px-6 z-10">
                                <p className="font-medium text-[13px]">Admin Luminus</p>
                                <p className="font-mono text-[13px] tracking-[0.1em] text-white/90">VA **** 5648</p>
                            </div>
                            {/* To maintain height mapping */}
                            <div className="h-5"></div>
                        </div>
                    </div>

                    {/* Popular Search -> Most Popular Courses (Green Bars) */}
                    <div className="mb-9">
                        <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-5">Most Popular Courses</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Fullstack Next.js', count: '4,632 siswa', w: 'w-[90%]', c: 'bg-[#84C529]' },
                                { name: 'React Patterns', count: '4,209 siswa', w: 'w-[80%]', c: 'bg-[#84C529]' },
                                { name: 'Golang Backend', count: '3,692 siswa', w: 'w-[65%]', c: 'bg-[#84C529]' },
                                { name: 'Figma to Code', count: '3,234 siswa', w: 'w-[45%]', c: 'bg-[#84C529]' },
                                { name: 'UI/UX Principles', count: '2,752 siswa', w: 'w-[35%]', c: 'bg-[#84C529]' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="w-full bg-gray-100 rounded-full h-[6px] mb-2 overflow-hidden">
                                        <div className={`${item.c} h-full rounded-full ${item.w}`}></div>
                                    </div>
                                    <div className="flex justify-between text-[13px] font-semibold">
                                        <span className="text-[#1a1a1a]">{item.name}</span>
                                        <span className="text-[#8e95a5] font-medium text-[12px]">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div className="mb-9">
                        <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-5">Trending Topics</h3>
                        <div className="flex flex-wrap gap-2">
                            {['#webdevelopment', '#uiux', '#frontend', '#nextjs', '#golang'].map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-gray-50/80 text-[#8e95a5] rounded text-[12.5px] font-medium border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Recent Messages -> Recent Reviews */}
                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-[17px] font-bold text-[#1a1a1a]">Recent Feedback</h3>
                            <a href="#" className="text-[13px] font-bold text-[#4F46E5] hover:underline">View All</a>
                        </div>
                        <div className="space-y-4 pt-1">
                            {[
                                { name: 'Budi Santoso', time: '12:45 PM', badge: '5★', color: 'bg-[#4F46E5]' },
                                { name: 'Siti Aminah', time: '11:30 PM', badge: '', color: 'bg-[#F59E0B]' },
                                { name: 'Reza Pratama', time: '11:28 PM', badge: '4★', color: 'bg-[#1E1B4B]' },
                                { name: 'Ayu Lestari', time: '11:18 PM', badge: '5★', color: 'bg-[#FDA4AF]' },
                                { name: 'Rizky Fadilah', time: '10:09 PM', badge: '', color: 'bg-[#FCD34D]' },
                            ].map((msg, i) => (
                                <div key={i} className="flex gap-3 items-center cursor-pointer">
                                    <div className={`w-[40px] h-[40px] rounded-lg ${msg.color} flex-shrink-0 flex items-center justify-center overflow-hidden`}>
                                        <div className="w-full h-full text-white/90 flex items-end justify-center">
                                            <User className="w-7 h-7 translate-y-2 opacity-80" fill="currentColor" strokeWidth={2} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className="text-[13.5px] font-semibold text-[#1a1a1a] truncate">{msg.name}</p>
                                            <p className="text-[11px] text-[#8e95a5] font-medium whitespace-nowrap">{msg.time}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[12px] text-[#8e95a5] truncate pr-2 font-medium">Materinya sangat mudah dipa...</p>
                                            {msg.badge ? (
                                                <span className="min-w-[20px] px-1 h-[20px] flex-shrink-0 flex items-center justify-center bg-[#EEEDFA] text-[#4F46E5] text-[10px] font-bold rounded">
                                                    {msg.badge}
                                                </span>
                                            ) : (
                                                <span className="w-[20px]"></span> // empty space
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
