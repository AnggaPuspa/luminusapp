import { Navbar, Footer, ScrollButton } from '@/components';
import Link from 'next/link';
import Image from 'next/image';

import '@/styles/home.css';
import '@/styles/common.css';

// Data Kursus 
const courses = [
    {
        id: 1,
        title: "Full-Stack JavaScript : Website LMS",
        image_url: "/images/lmsjs.png",
        duration: 12,
        video_count: 6,
        original_price: 550000,
        discounted_price: 299000,
    },
    {
        id: 2,
        title: "Full-Stack JavaScript : Website LMS",
        image_url: "/images/lmsjs.png",
        duration: 12,
        video_count: 6,
        original_price: 550000,
        discounted_price: 299000,
    },
    {
        id: 3,
        title: "Full-Stack JavaScript : Website LMS",
        image_url: "/images/lmsjs.png",
        duration: 12,
        video_count: 6,
        original_price: 550000,
        discounted_price: 299000,
    },
    {
        id: 4,
        title: "Full-Stack JavaScript : Website LMS",
        image_url: "/images/lmsjs.png",
        duration: 12,
        video_count: 6,
        original_price: 550000,
        discounted_price: 299000,
    }
];

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
    }).format(price);
}

export default function KursusPage() {
    return (
        <main className="min-h-screen bg-[#f1f2f6]">
            <ScrollButton />
            <Navbar />

            {/* Hero Section Banner */}
            <section className="w-full pt-32 pb-10 flex justify-center items-center">
                <div className="w-[85%] bg-blue-primary rounded-[32px] md:overflow-hidden flex relative px-8 py-16 md:px-14 lg:py-24">
                    <div className="w-full lg:w-[60%] z-10 text-white">
                        <h1 className="text-3xl md:text-3xl lg:text-4xl font-bold mb-4 w-[100%] max-w-[400px]">
                            Temukan Kursus Terbaik untuk Mu!
                        </h1>

                        {/* Search Bar - No ngide, plain flex container input */}
                        <div className="flex bg-white rounded-xl p-[6px] max-w-[450px] w-full mb-6 relative mt-8">
                            <input
                                type="text"
                                placeholder="Cari kursus"
                                className="flex-1 outline-none px-4 text-black font-normal placeholder:opacity-50"
                            />
                            <button className="bg-gradient-to-r from-gradient-1 to-gradient-2 w-12 h-10 rounded-lg flex justify-center items-center text-white">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>

                        {/* Rekomendasi Tags */}
                        <div className="flex flex-wrap items-center gap-3 text-white">
                            <span className="opacity-70">Rekomendasi:</span>
                            <div className="flex gap-4">
                                <Link href="#" className="opacity-70 hover:opacity-100 underline">Struktur Data</Link>
                                <Link href="#" className="opacity-70 hover:opacity-100 underline">Algoritma</Link>
                                <Link href="#" className="opacity-70 hover:opacity-100 underline">Laravel</Link>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block absolute right-0 bottom-0 top-[-20%] w-[45%] z-0">
                        <Image src="/images/Group 736.png" alt="Hero People" fill className="object-contain object-bottom" />
                    </div>
                </div>
            </section>

            {/* Grid List Kursus */}
            <section className="w-full pb-24 flex justify-center items-center mt-6">
                <div className="w-[85%]">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                        <p className="text-[30px] font-semibold text-black">Rekomendasi Kursus</p>

                        <button className="bg-white px-5 py-2 rounded-full shadow-[rgba(149,_157,_165,_0.1)_0px_8px_24px] text-black">
                            Semua <i className="fa-solid fa-chevron-down ml-2"></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                        {courses.map((course) => (
                            <div key={course.id} className="blog-card bg-white hover:-translate-y-2 transition-transform duration-300 h-fit">
                                <Image
                                    src={course.image_url}
                                    alt={course.title}
                                    width={400}
                                    height={200}
                                    className="w-[90%] mx-auto object-cover rounded-xl"
                                    style={{ height: 'auto' }}
                                />
                                <div className="blog-content">

                                    <div className="flex gap-4 mt-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <i className="fas fa-clock text-gradient-1"></i>
                                            <span>{course.duration} jam</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <i className="fa-solid fa-book-open text-gradient-1"></i>
                                            <span>{course.video_count} modul</span>
                                        </div>
                                    </div>

                                    <p className="text-lg font-medium mt-4 text-black">{course.title}</p>

                                    <div className="mt-4">
                                        {course.discounted_price ? (
                                            <>
                                                <span className="line-through text-[#E63946]">
                                                    Rp. {formatPrice(course.original_price)}
                                                </span>
                                                <span className="font-semibold text-lg ml-2 text-black">
                                                    Rp. {formatPrice(course.discounted_price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="font-semibold text-lg ml-2 text-black">
                                                Rp. {formatPrice(course.original_price)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <Link
                                            href={`/payment/${course.id}`}
                                            className="px-6 py-3 font-medium rounded-lg bg-[#696EFF] text-white inline-block"
                                        >
                                            Beli Kursus
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
