import Image from "next/image";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { Navbar, Footer } from '@/components';
import '@/styles/home.css';
import '@/styles/common.css';

export default function ForumPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-6 md:p-12 mt-16 md:mt-24 mb-10">
                <div className="max-w-[1000px] w-full flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">

                    {/* Left Side - 3D Illustration / Big Visual */}
                    <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] relative shrink-0">
                        <Image
                            src="/images/forum_construction_flat.png"
                            alt="Forum Under Construction"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex flex-col text-left max-w-lg">
                        <h1 className="text-[28px] md:text-[36px] font-bold text-[#1f2937] mb-4">
                            Forum Sedang Dibangun
                        </h1>

                        <p className="text-[15px] md:text-[16px] text-gray-500 mb-8 leading-relaxed">
                            Mungkin kamu datang terlalu cepat. Fitur ruang diskusi ini sedang dalam tahap pengembangan. Tapi tenang — kamu masih bisa kembali belajar.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Link
                                href="/"
                                className="inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-[#696EFF] to-[#F8ACFF] text-white rounded-md font-semibold text-[14px] hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                            >
                                Kembali ke Beranda
                            </Link>

                            <Link
                                href="/kursus"
                                className="inline-flex items-center gap-2 text-[#032038] text-[14px] font-medium hover:opacity-75 transition-colors"
                            >
                                atau lihat kelas kami <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
