"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck, GraduationCap, Mail, Phone, CalendarDays, BookOpen, Receipt } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface UserDetailDrawerProps {
    user: any | null;
    onClose: () => void;
}

export default function UserDetailDrawer({ user, onClose }: UserDetailDrawerProps) {
    const isOpen = !!user;

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {user ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-[15px] font-bold text-[#1a1a1a]">Detail Pengguna</h2>
                                <p className="text-[12px] text-gray-400 font-mono mt-0.5">#{user.id.slice(-8)}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Profile Block */}
                            <div className="px-6 pt-6 pb-2">
                                <div className="flex items-center gap-4">
                                    {user.image ? (
                                        <img src={user.image} alt="" className="w-[60px] h-[60px] rounded-full object-cover border border-gray-100 shadow-sm ring-4 ring-gray-50" />
                                    ) : (
                                        <div className="w-[60px] h-[60px] rounded-full bg-gray-50 flex items-center justify-center text-[#1a1a1a] text-[22px] font-bold border border-gray-100 shadow-sm ring-4 ring-gray-50">
                                            {(user.name || "?")[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="text-[20px] font-bold text-[#1a1a1a] truncate tracking-tight leading-tight mb-1.5">{user.name || "—"}</h3>
                                        <div className="flex items-center gap-1.5">
                                            {user.role === "ADMIN" ? (
                                                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gray-500">
                                                    <ShieldCheck className="w-[14px] h-[14px]" /> Administrator
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gray-500">
                                                    <GraduationCap className="w-[14px] h-[14px]" /> Siswa
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sections */}
                            <div className="px-6 py-5 space-y-5">
                                {/* Contact Info */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Informasi Kontak</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-[12px] text-gray-500">Email</span>
                                            </div>
                                            <span className="text-[13px] text-[#1a1a1a]">{user.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-[12px] text-gray-500">Telepon</span>
                                            </div>
                                            <span className="text-[13px] text-[#1a1a1a]">{user.phoneNumber || "—"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-[12px] text-gray-500">Bergabung</span>
                                            </div>
                                            <span className="text-[13px] font-semibold text-[#1a1a1a]">
                                                {format(new Date(user.createdAt), "dd MMM yyyy", { locale: localeId })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Identifiers */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Identifikasi</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">User ID</span>
                                            <span className="text-[11px] font-mono text-gray-400 select-all">{user.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[12px] text-gray-500">Role</span>
                                            <span className="text-[13px] font-semibold text-[#1a1a1a]">{user.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Summary */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Aktivitas</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                                                <span className="text-[11px] text-gray-500 font-medium">Pendaftaran</span>
                                            </div>
                                            <p className="text-[22px] font-bold text-[#1a1a1a]">{user._count?.enrollments || 0}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">kelas terdaftar</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Receipt className="w-4 h-4 text-[#4F46E5]" />
                                                <span className="text-[11px] text-gray-500 font-medium">Transaksi</span>
                                            </div>
                                            <p className="text-[22px] font-bold text-[#1a1a1a]">{user._count?.transactions || 0}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">total transaksi</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Enrollments */}
                                {user.enrollments && user.enrollments.length > 0 && (
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Kelas yang Diikuti (Terbaru)</h4>
                                        <div className="bg-gray-50 rounded-xl p-2 space-y-1">
                                            {user.enrollments.map((enr: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                                    {enr.course.thumbnailUrl ? (
                                                        <img src={enr.course.thumbnailUrl} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-200" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-md bg-[#EEEDFA] flex items-center justify-center text-[#4F46E5]">
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{enr.course.title}</p>
                                                        <p className="text-[11px] text-gray-500 mt-0.5">Mendaftar: {format(new Date(enr.enrolledAt), "dd MMM yyyy", { locale: localeId })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Reviews */}
                                {user.reviews && user.reviews.length > 0 && (
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Ulasan Kelas (Terbaru)</h4>
                                        <div className="bg-gray-50 rounded-xl p-2 space-y-1">
                                            {user.reviews.map((rev: any) => (
                                                <div key={rev.id} className="p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <p className="text-[12.5px] font-semibold text-[#1a1a1a] truncate pr-2">{rev.course.title}</p>
                                                        <div className="flex items-center gap-0.5 shrink-0 bg-[#FFFBEB] px-1.5 py-0.5 rounded text-amber-500">
                                                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                                            <span className="text-[11px] font-bold">{rev.rating}</span>
                                                        </div>
                                                    </div>
                                                    {rev.comment && (
                                                        <p className="text-[12px] text-gray-500 italic line-clamp-2">"{rev.comment}"</p>
                                                    )}
                                                    <p className="text-[10px] text-gray-400 mt-1.5">{format(new Date(rev.createdAt), "dd MMM yyyy", { locale: localeId })}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Transactions */}
                                {user.transactions && user.transactions.length > 0 && (
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Riwayat Transaksi (Terbaru)</h4>
                                        <div className="bg-gray-50 rounded-xl p-2 space-y-1">
                                            {user.transactions.map((trx: any) => (
                                                <div key={trx.id} className="flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-semibold text-[#1a1a1a]">
                                                            Rp {trx.amount.toLocaleString("id-ID")}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-[11px] font-mono text-gray-400">#{trx.paymentToken || trx.id.slice(-8)}</p>
                                                            <span className="text-gray-300">•</span>
                                                            <p className="text-[11px] text-gray-500">{format(new Date(trx.createdAt), "dd MMM yy")}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {trx.status === "PAID" ? (
                                                            <span className="px-2 py-1 bg-[#F0FDF4] text-[#22C55E] text-[10px] font-bold rounded">LUNAS</span>
                                                        ) : trx.status === "PENDING" ? (
                                                            <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded">PENDING</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-[#FEF2F2] text-[#EF4444] text-[10px] font-bold rounded">{trx.status}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
}
