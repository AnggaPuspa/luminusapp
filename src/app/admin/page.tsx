import React from "react";
import {
    MoreHorizontal, ArrowUpRight, ArrowDownRight,
    RefreshCw, Calendar, Filter,
    CheckCircle2, XCircle, Clock,
    User, Check
} from 'lucide-react';
import { getDashboardStats } from "@/services/admin.service";
import Image from "next/image";
import { EnrollmentChart } from "@/components/admin/EnrollmentChart";

function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

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
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-1.5">{formatRupiah(stats.totalRevenue)}</p>
                                <p className={`${stats.revenueChange.isPositive ? 'text-[#84C529] bg-[#84C529]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] flex items-center w-fit px-1.5 py-0.5 rounded`}>
                                    {stats.revenueChange.isPositive 
                                        ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
                                        : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
                                    } {stats.revenueChange.isPositive ? '+' : ''}{stats.revenueChange.value}%
                                </p>
                            </div>
                            <div className="relative w-14 h-14 rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-45 shrink-0"></div>
                        </div>

                        {/* Number of Sales */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-transparent hover:border-gray-50 transition-colors">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-semibold mb-1 uppercase tracking-wider">Total Enrollments</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-1.5">{new Intl.NumberFormat('id-ID').format(stats.totalEnrollments)}</p>
                                <p className={`${stats.enrollmentChange.isPositive ? 'text-[#84C529] bg-[#84C529]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] flex items-center w-fit px-1.5 py-0.5 rounded`}>
                                    {stats.enrollmentChange.isPositive 
                                        ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
                                        : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
                                    } {stats.enrollmentChange.isPositive ? '+' : ''}{stats.enrollmentChange.value}%
                                </p>
                            </div>
                            <div className="relative w-14 h-14 rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 border-b-gray-100 rotate-[-15deg] shrink-0"></div>
                        </div>

                        {/* Product Views */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-transparent hover:border-gray-50 transition-colors">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-semibold mb-1 uppercase tracking-wider">Active Students</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-1.5">{new Intl.NumberFormat('id-ID').format(stats.activeStudents)}</p>
                                <p className={`${stats.studentChange.isPositive ? 'text-[#84C529] bg-[#84C529]/10' : 'text-[#ef4444] bg-[#ef4444]/10'} font-bold text-[12px] flex items-center w-fit px-1.5 py-0.5 rounded`}>
                                    {stats.studentChange.isPositive 
                                        ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
                                        : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
                                    } {stats.studentChange.isPositive ? '+' : ''}{stats.studentChange.value}%
                                </p>
                            </div>
                            <div className="relative w-14 h-14 rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 rotate-[130deg] shrink-0"></div>
                        </div>
                    </div>

                    {/* Purchase Activity Chart -> Dynamic Enrollment Activity */}
                    <EnrollmentChart 
                        availableYears={stats.availableYears} 
                        initialData={stats.monthlyActivity} 
                        initialYear={new Date().getFullYear()} 
                    />

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
                                    {stats.latestTransactions.map((tx) => {
                                        const statusConfig = tx.status === 'PAID' ? { label: 'Completed', color: 'bg-[#F0FDF4] text-[#22C55E]', icon: <CheckCircle2 className="w-3.5 h-3.5 fill-[#22c55e] text-white" /> } :
                                            tx.status === 'FAILED' || tx.status === 'EXPIRED' ? { label: 'Canceled', color: 'bg-[#FEF2F2] text-[#EF4444]', icon: <XCircle className="w-3.5 h-3.5 fill-[#ef4444] text-white" /> } :
                                            { label: 'Pending', color: 'bg-[#F3F4F6] text-[#4B5563]', icon: <Clock className="w-3 h-3 text-gray-500" strokeWidth={2.5} /> };
                                        
                                        const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(tx.createdAt));
                                        
                                        return (
                                        <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                            {/* We use a wrapper div inside TD to create the continuous border/background effect for rows without border-bottom on TR */}
                                            <td className="p-0 relative">
                                                <div className="h-[64px] flex items-center justify-center px-4 transition-colors">
                                                    <input type="checkbox" className="w-[16px] h-[16px] rounded-[4px] border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                                </div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3`}>
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-[32px] h-[32px] rounded-lg shadow-sm shrink-0 bg-gray-100 overflow-hidden relative`}>
                                                            {tx.course?.thumbnailUrl && (
                                                                <Image src={tx.course.thumbnailUrl} alt={tx.course.title || "Course"} fill className="object-cover" sizes="32px"/>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-[#1a1a1a] text-[13.5px] whitespace-nowrap leading-tight truncate max-w-[170px]">{tx.course?.title || "Unknown Course"}</p>
                                                            <p className="text-[12px] text-[#8e95a5] mt-0.5 whitespace-nowrap leading-tight">{tx.user?.name || "Unknown User"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 text-gray-500 font-medium text-[13px] whitespace-nowrap`}>
                                                    {tx.id.split('-')[0] + '-' + tx.id.substring(0, 4)}...
                                                </div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 text-[#8e95a5] text-[13px] font-medium whitespace-nowrap`}>{dateLabel}</div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 font-semibold text-[#1a1a1a] text-[13.5px] whitespace-nowrap`}>{formatRupiah(tx.amount)}</div>
                                            </td>
                                            <td className="p-0">
                                                <div className={`h-[64px] flex items-center px-3 overflow-hidden`}>
                                                    <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] whitespace-nowrap font-semibold ${statusConfig.color}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
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
                                    )})}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="p-5 px-6 pt-2 flex items-center justify-between text-[13px] text-gray-500">
                            <p>Showing <span className="font-semibold text-[#1a1a1a]">1-{stats.latestTransactions.length}</span> from <span className="font-semibold text-[#1a1a1a]">{stats.totalTransactions}</span> data</p>
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
                            <h2 className="text-[28px] font-bold tracking-tight mb-7 drop-shadow-sm">{formatRupiah(stats.totalRevenue)}</h2>

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
                            {stats.popularCourses.map((item) => (
                                <div key={item.id}>
                                    <div className="w-full bg-gray-100 rounded-full h-[6px] mb-2 overflow-hidden">
                                        <div className={`bg-[#84C529] h-full rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[13px] font-semibold">
                                        <span className="text-[#1a1a1a] truncate pr-4">{item.title}</span>
                                        <span className="text-[#8e95a5] font-medium text-[12px] shrink-0">{new Intl.NumberFormat('id-ID').format(item.enrollmentCount)} siswa</span>
                                    </div>
                                </div>
                            ))}
                            
                            {stats.popularCourses.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">Belum ada data kursus</p>
                            )}
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
                            {stats.recentFeedback.map((review, i) => {
                                const colors = ['bg-[#4F46E5]', 'bg-[#F59E0B]', 'bg-[#1E1B4B]', 'bg-[#FDA4AF]', 'bg-[#FCD34D]'];
                                const color = colors[i % colors.length];
                                const timeOpt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(review.createdAt));
                                
                                return (
                                <div key={review.id} className="flex gap-3 items-center cursor-pointer">
                                    <div className={`w-[40px] h-[40px] rounded-lg ${color} flex-shrink-0 flex items-center justify-center overflow-hidden relative`}>
                                        {review.user?.avatarUrl ? (
                                            <Image src={review.user.avatarUrl} alt={review.user.name || "User"} fill className="object-cover" sizes="40px" />
                                        ) : (
                                        <div className="w-full h-full text-white/90 flex items-end justify-center">
                                            <User className="w-7 h-7 translate-y-2 opacity-80" fill="currentColor" strokeWidth={2} />
                                        </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className="text-[13.5px] font-semibold text-[#1a1a1a] truncate">{review.user?.name || "Unknown User"}</p>
                                            <p className="text-[11px] text-[#8e95a5] font-medium whitespace-nowrap">{timeOpt}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[12px] text-[#8e95a5] truncate pr-2 font-medium">{review.comment || "Memberikan rating"}</p>
                                            {review.rating ? (
                                                <span className="min-w-[20px] px-1 h-[20px] flex-shrink-0 flex items-center justify-center bg-[#EEEDFA] text-[#4F46E5] text-[10px] font-bold rounded">
                                                    {review.rating}★
                                                </span>
                                            ) : (
                                                <span className="w-[20px]"></span> // empty space
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
