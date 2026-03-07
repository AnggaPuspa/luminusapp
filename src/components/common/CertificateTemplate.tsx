"use client";

import React, { forwardRef } from 'react';
import Image from 'next/image';

interface CertificateTemplateProps {
    studentName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
    ({ studentName, courseTitle, completionDate, certificateId }, ref) => {
        return (
            <div
                ref={ref}
                className="w-[1123px] h-[794px] bg-white relative overflow-hidden flex flex-col items-center justify-center font-sans shadow-2xl shrink-0"
                style={{
                    backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)',
                }}
            >
                {/* Decorative corner borders */}
                <div className="absolute top-0 left-0 w-64 h-64 border-t-[16px] border-l-[16px] border-blue-600 rounded-tl-3xl m-8"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 border-b-[16px] border-r-[16px] border-blue-600 rounded-br-3xl m-8"></div>

                {/* Internal Border */}
                <div className="absolute inset-8 border-2 border-blue-200 rounded-2xl pointer-events-none"></div>

                {/* Content Container */}
                <div className="z-10 flex flex-col items-center text-center px-24 w-full">
                    {/* Logo / Header */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="text-4xl font-extrabold tracking-tight text-blue-900 flex items-center gap-3">
                            <span className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">L</span>
                            Luminus Education
                        </div>
                    </div>

                    <h1 className="text-6xl font-serif text-gray-800 mb-6 tracking-widest uppercase">
                        Certificate of Completion
                    </h1>

                    <div className="w-32 h-1 bg-blue-500 mb-10 rounded-full"></div>

                    <p className="text-xl text-gray-600 mb-6 uppercase tracking-widest">
                        KAMI MENYATAKAN DENGAN BANGGA BAHWA
                    </p>

                    <h2 className="text-7xl font-bold text-blue-900 mb-6 font-serif italic py-4 border-b-2 border-gray-200 w-full max-w-3xl">
                        {studentName}
                    </h2>

                    <p className="text-xl text-gray-600 mb-6">
                        telah berhasil menyelesaikan dengan memuaskan kelas:
                    </p>

                    <h3 className="text-4xl font-bold text-gray-800 mb-16 leading-tight max-w-4xl">
                        {courseTitle}
                    </h3>

                    {/* Footer Area */}
                    <div className="flex justify-between w-full max-w-4xl mt-8 pt-8 border-t border-gray-200">
                        <div className="text-left">
                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Tanggal Penyelesaian</p>
                            <p className="text-xl font-bold text-gray-800">{completionDate}</p>
                        </div>

                        <div className="flex flex-col items-center">
                            {/* Optional Badge Graphic */}
                            <div className="w-24 h-24 bg-blue-100 rounded-full border-4 border-blue-600 flex items-center justify-center -mt-16 mb-2 shadow-lg bg-white">
                                <span className="text-3xl">🏆</span>
                            </div>
                            <p className="font-bold text-blue-900 mt-2">Luminus Team</p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">ID Sertifikat</p>
                            <p className="text-sm font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded">{certificateId}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
