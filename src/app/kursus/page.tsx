import { Navbar, Footer, ScrollButton } from '@/components';
import Link from 'next/link';
import Image from 'next/image';
import prisma from "@/lib/prisma";
import CheckoutButton from '@/components/common/CheckoutButton';

import '@/styles/home.css';
import '@/styles/common.css';
import { CourseSearch } from '@/components/kursus/CourseSearch';
import { CourseFilter } from '@/components/kursus/CourseFilter';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Removed ISR cache to allow fully dynamic search parameters

export default async function KursusPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    // Determine search query
    const searchQuery = typeof params.q === 'string' ? params.q : undefined;

    // Fetch published courses from database with optional search
    const courses = await prisma.course.findMany({
        where: {
            status: "PUBLISHED",
            deletedAt: null,
            ...(searchQuery ? {
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { slug: { contains: searchQuery, mode: 'insensitive' } }
                ]
            } : {})
        },
        select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            originalPrice: true,
            discountedPrice: true,
            duration: true,
            reviews: {
                select: { rating: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

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

                        <CourseSearch />
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
                        <p className="text-[30px] font-semibold text-black">
                            {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : "Rekomendasi Kursus"}
                        </p>

                        <CourseFilter />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                        {courses.length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm">
                                <i className="fa-solid fa-folder-open text-4xl mb-4 opacity-50"></i>
                                <p className="text-lg font-medium">Kursus tidak ditemukan</p>
                                <p className="text-sm opacity-80">Coba gunakan kata kunci lain</p>
                            </div>
                        )}
                        {(courses as any[]).map((course) => (
                            <div key={course.id} className="blog-card bg-white hover:-translate-y-2 transition-transform duration-300 h-fit flex flex-col justify-between">
                                <Link href={`/kursus/${course.slug}`}>
                                    <Image
                                        src={course.thumbnailUrl || "/images/lmsjs.png"}
                                        alt={course.title}
                                        width={400}
                                        height={200}
                                        className="w-[90%] mx-auto object-cover rounded-xl mt-[5%]"
                                        style={{ height: 'auto', aspectRatio: "16/9" }}
                                    />
                                </Link>
                                <div className="blog-content flex-grow flex flex-col justify-between">
                                    
                                    <div>
                                        <div className="flex gap-4 mt-2 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-clock text-gradient-1"></i>
                                                <span className="text-sm">{course.duration} jam</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <i className="fa-solid fa-book-open text-gradient-1"></i>
                                                <span className="text-sm">Materi</span>
                                            </div>
                                        </div>

                                        {/* Rating Section */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex text-yellow-400 text-[13px]">
                                                {[...Array(5)].map((_, i) => {
                                                    const avgRating = course.reviews.length > 0
                                                        ? course.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / course.reviews.length
                                                        : 0;

                                                    if (i < Math.floor(avgRating)) return <i key={i} className="fa-solid fa-star"></i>;
                                                    if (i === Math.floor(avgRating) && avgRating % 1 >= 0.5) return <i key={i} className="fa-solid fa-star-half-stroke"></i>;
                                                    return <i key={i} className="fa-regular fa-star text-gray-300"></i>;
                                                })}
                                            </div>
                                            <span className="text-[13px] font-medium text-gray-600 mt-0.5">
                                                {course.reviews.length > 0
                                                    ? (course.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / course.reviews.length).toFixed(1)
                                                    : "0.0"}
                                                <span className="text-gray-400 ml-1">({course.reviews.length})</span>
                                            </span>
                                        </div>

                                        <Link href={`/kursus/${course.slug}`}>
                                            <p className="text-[17px] font-semibold mt-3 text-black hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{course.title}</p>
                                        </Link>

                                        <div className="mt-4">
                                            {course.discountedPrice ? (
                                                <div className="flex flex-col">
                                                    <span className="line-through text-[#E63946] text-sm font-medium">
                                                        Rp. {formatPrice(course.originalPrice)}
                                                    </span>
                                                    <span className="font-bold text-[19px] text-black">
                                                        Rp. {formatPrice(course.discountedPrice)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-transparent text-sm font-medium select-none line-through">Spacer</span>
                                                    <span className="font-bold text-[19px] text-black mt-[-20px]">
                                                    Rp. {formatPrice(course.originalPrice)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 w-full">
                                        <CheckoutButton
                                            courseId={course.id}
                                            title={course.title}
                                            originalPrice={course.originalPrice}
                                            discountedPrice={course.discountedPrice}
                                            className="w-full py-2.5 font-semibold rounded-lg bg-[#696EFF] hover:bg-[#5b5fd6] text-white transition-colors text-center shadow-sm"
                                        />
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
