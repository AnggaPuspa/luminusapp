"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Users, ArrowUpRight, MoreHorizontal, Search, Filter, TrendingUp, ShieldCheck, GraduationCap, Calendar } from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const totalAdmins = users.filter(u => u.role === "ADMIN").length;
    const totalStudents = users.filter(u => u.role === "USER").length;
    const totalEnrollments = users.reduce((acc, u) => acc + (u._count?.enrollments || 0), 0);
    const totalTransactions = users.reduce((acc, u) => acc + (u._count?.transactions || 0), 0);

    const filteredUsers = users.filter(u => {
        const matchSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const totalItems = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    // Build last 15 days registration chart data
    const chartDays = Array.from({ length: 15 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (14 - i));
        return {
            label: format(d, "dd", { locale: id }),
            dateStr: format(d, "yyyy-MM-dd"),
            count: 0
        };
    });
    users.forEach(u => {
        const dayStr = format(new Date(u.createdAt), "yyyy-MM-dd");
        const slot = chartDays.find(d => d.dateStr === dayStr);
        if (slot) slot.count++;
    });
    const maxCount = Math.max(...chartDays.map(d => d.count), 1);
    const newThisMonth = users.filter(u => {
        const d = new Date(u.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* Top Section: Overview + Stat Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left: User Growth Chart */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-7 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">User Growth</h2>
                        <div className="flex gap-2">
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
                                <Calendar className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                            <button className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
                                <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-[34px] font-bold text-[#1a1a1a] leading-none">{loading ? "—" : users.length}</h3>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#84C529]" strokeWidth={2.5} />
                                <span className="text-[13px] font-medium text-[#8e95a5]">Total pengguna terdaftar</span>
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#8e95a5]">
                            {loading ? "—" : newThisMonth} baru bulan ini
                        </span>
                    </div>

                    {/* Bar Chart: Daily Registrations */}
                    <div className="h-[140px] flex items-end justify-between gap-1 overflow-hidden px-2">
                        {loading ? (
                            Array.from({ length: 15 }, (_, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 flex-1">
                                    <div className="w-3 md:w-3.5 h-[100px] bg-gray-100 rounded-full animate-pulse" />
                                    <span className="text-[11px] font-medium text-[#8e95a5] opacity-0">00</span>
                                </div>
                            ))
                        ) : (
                            chartDays.map((bar, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 flex-1" title={`${bar.dateStr}: ${bar.count} user`}>
                                    <div className="w-3 md:w-3.5 h-[100px] bg-gray-50 rounded-full relative overflow-hidden">
                                        <div
                                            className="absolute bottom-0 inset-x-0 bg-[#4F46E5] rounded-full transition-all duration-700 hover:opacity-80"
                                            style={{ height: `${bar.count > 0 ? Math.max((bar.count / maxCount) * 100, 8) : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-medium text-[#8e95a5]">{bar.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: 4 Stat Mini Cards */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Users</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : users.length}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Semua role
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-t-gray-100 border-l-gray-100 rotate-45 shrink-0"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Students</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : totalStudents}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Role USER
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-r-gray-100 border-b-gray-100 rotate-[-15deg] shrink-0"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Enrollment</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : totalEnrollments}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Semua kelas
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-l-gray-100 border-r-gray-100 border-t-gray-100 rotate-[40deg] shrink-0"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-gray-50 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[#8e95a5] text-[13px] font-medium mb-1.5">Total Transaksi</p>
                                <p className="text-[24px] font-bold text-[#1a1a1a] mb-2">{loading ? "—" : totalTransactions}</p>
                                <p className="text-[#84C529] font-medium text-[12px] flex items-center mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} /> Semua users
                                </p>
                            </div>
                            <div className="relative w-[50px] h-[50px] rounded-full border-[6px] border-[#4F46E5] border-b-gray-100 rotate-[90deg] shrink-0"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Users Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-transparent">
                <div className="p-5 md:p-6 pb-4 md:pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Daftar Pengguna</h2>
                        <p className="text-[13px] text-[#8e95a5] font-medium mt-0.5">Semua student dan admin yang terdaftar</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative hidden md:block">
                            <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors w-60 hover:bg-gray-100"
                            />
                        </div>
                        <div className="relative hidden sm:block">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-100 bg-gray-50 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors cursor-pointer hover:bg-gray-100 text-gray-600"
                            >
                                <option value="ALL">All Role</option>
                                <option value="USER">Student</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <Filter className="w-[14px] h-[14px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-50 whitespace-nowrap">
                            <tr>
                                <th className="px-4 py-4 font-normal w-[22%]">Nama</th>
                                <th className="px-4 py-4 font-normal w-[25%]">Email</th>
                                <th className="px-4 py-4 font-normal w-[11%]">Role</th>
                                <th className="px-4 py-4 font-normal w-[14%]">Enrollments</th>
                                <th className="px-4 py-4 font-normal w-[14%]">Transaksi</th>
                                <th className="px-4 py-4 font-normal w-[14%]">Bergabung</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#8e95a5] font-medium">
                                        Memuat data pengguna...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-8 h-8 text-gray-300" />
                                            <p className="text-[13px] font-semibold text-[#1a1a1a]">
                                                {searchTerm || roleFilter !== "ALL" ? "Tidak ada user ditemukan" : "Belum ada pengguna"}
                                            </p>
                                            <p className="text-[12px] text-[#8e95a5] font-medium">
                                                {searchTerm || roleFilter !== "ALL" ? "Coba ubah filter pencarian" : "User akan muncul setelah registrasi"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                        {/* Nama */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden">
                                                <span className="font-semibold text-[#1a1a1a] text-[13.5px] truncate block w-full">{user.name || "—"}</span>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 overflow-hidden">
                                                <span className="text-[13px] text-[#8e95a5] font-medium truncate block w-full" title={user.email}>{user.email}</span>
                                            </div>
                                        </td>
                                        {/* Role */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                {user.role === "ADMIN" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#1a1a1a] text-white">
                                                        <ShieldCheck className="w-3 h-3" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] whitespace-nowrap font-semibold bg-[#EEEDFA] text-[#4F46E5]">
                                                        <GraduationCap className="w-3 h-3" /> Student
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Enrollments */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">{user._count?.enrollments || 0} <span className="font-medium text-[#8e95a5]">kelas</span></span>
                                            </div>
                                        </td>
                                        {/* Transaksi */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4">
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">{user._count?.transactions || 0} <span className="font-medium text-[#8e95a5]">transaksi</span></span>
                                            </div>
                                        </td>
                                        {/* Bergabung */}
                                        <td className="p-0">
                                            <div className="h-[64px] flex items-center px-4 text-[#8e95a5] text-[13px] font-medium whitespace-nowrap overflow-hidden">
                                                <span className="truncate block w-full">{format(new Date(user.createdAt), "dd MMM yyyy", { locale: id })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-5 px-6 pt-4 flex items-center justify-between text-[13px] text-gray-500 border-t border-gray-50">
                    <p>Showing <span className="font-semibold text-[#1a1a1a]">{totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, totalItems)}</span> from <span className="font-semibold text-[#1a1a1a]">{totalItems}</span> data</p>
                    <div className="flex gap-1 items-center">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >&lt;</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = currentPage;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                                <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md font-medium transition-colors ${currentPage === pageNum ? "bg-[#4F46E5] text-white shadow-sm font-semibold" : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                                        }`}>{pageNum}</button>
                            );
                        })}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >&gt;</button>
                    </div>
                </div>
            </div>

        </div>
    );
}
