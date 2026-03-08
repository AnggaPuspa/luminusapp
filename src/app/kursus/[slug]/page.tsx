import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { cache } from "react";
import CheckoutButton from "@/components/common/CheckoutButton";
import { Navbar, Footer } from "@/components";

export const revalidate = 3600; // ISR: cache 1 hour

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

// Deduplicate: generateMetadata + page share this single DB call per request
const getCourseBySlug = cache(async (slug: string) => {
    return prisma.course.findUnique({
        where: {
            slug,
            status: "PUBLISHED",
            deletedAt: null
        },
        include: {
            modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    lessons: {
                        orderBy: { sortOrder: 'asc' },
                        select: { id: true, title: true, duration: true }
                    }
                }
            },
            reviews: {
                include: {
                    user: { select: { name: true, avatarUrl: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    }) as any;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);
    if (!course) return { title: "Kursus Tidak Ditemukan" };
    return {
        title: `${course.title} | Luminus Education`,
        description: course.description?.substring(0, 150) || "Pelajari materi ini di Luminus Education."
    };
}

export default async function PublicCourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) notFound();

    // Calculate rating
    const avgRating = course.reviews.length > 0
        ? course.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / course.reviews.length
        : 0;

    return (
        <main className="min-h-screen bg-[#f1f2f6]">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-blue-primary pt-32 pb-16 px-6 relative overflow-hidden">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="w-full md:w-2/3 text-white">
                        <Link href="/kursus" className="inline-flex items-center text-sm text-blue-200 hover:text-white mb-6 transition">
                            <i className="fa-solid fa-arrow-left mr-2"></i> Kembali ke Katalog
                        </Link>

                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{course.title}</h1>
                        <p className="text-blue-100 text-lg md:text-xl mb-6 leading-relaxed max-w-2xl">
                            {course.description || "Tingkatkan skill Anda dengan materi terstruktur dari praktisi ahli."}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-blue-50 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={`fa-solid ${i < Math.floor(avgRating) ? 'fa-star' : (i === Math.floor(avgRating) && avgRating % 1 >= 0.5 ? 'fa-star-half-stroke' : 'fa-star text-blue-300')}`}></i>
                                    ))}
                                </div>
                                <span>{avgRating.toFixed(1)} ({course.reviews.length} Ulasan)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fa-regular fa-clock"></i> {course.duration} Jam Total Belajar
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-book-open"></i> {course.modules.length} Modul
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl relative text-black">
                            <Image
                                src={course.thumbnailUrl || "/images/lmsjs.png"}
                                alt={course.title}
                                width={600}
                                height={400}
                                className="w-full h-auto rounded-xl mb-6 object-cover"
                            />

                            <div className="mb-6">
                                {course.discountedPrice ? (
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 line-through text-lg">{formatPrice(course.originalPrice)}</span>
                                        <span className="text-3xl font-bold text-gray-900">{formatPrice(course.discountedPrice)}</span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-900">{formatPrice(course.originalPrice)}</span>
                                )}
                            </div>

                            <CheckoutButton
                                courseId={course.id}
                                title={course.title}
                                originalPrice={course.originalPrice}
                                discountedPrice={course.discountedPrice}
                                className="w-full py-4 bg-[#696EFF] hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition shadow-lg shadow-blue-200 flex justify-center items-center"
                            />

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Akses selamanya & update materi gratis
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl rounded-full"></div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 text-black">

                {/* Left Column (Kurikulum & Reviews) */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Kurikulum */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <i className="fa-solid fa-list-check text-blue-primary"></i> Kurikulum Kelas
                        </h2>

                        <div className="space-y-4">
                            {course.modules.length > 0 ? course.modules.map((module: any, idx: number) => (
                                <div key={module.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition">
                                    <div className="p-5 bg-gray-50 border-b border-gray-100 font-semibold text-gray-800 flex justify-between items-center">
                                        <span>Modul {idx + 1}: {module.title}</span>
                                        <span className="text-sm font-normal text-gray-500">{module.lessons.length} Materi</span>
                                    </div>
                                    <div className="p-2">
                                        {module.lessons.map((lesson: any, lIdx: number) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-lg transition">
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <i className="fa-regular fa-circle-play text-gray-400"></i>
                                                    <span>{lIdx + 1}. {lesson.title}</span>
                                                </div>
                                                <span className="text-sm text-gray-400">{lesson.duration} mnt</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 italic">Kurikulum sedang disusun.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Ulasan Siswa */}
                    <section id="reviews">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <i className="fa-regular fa-comments text-blue-primary"></i> Ulasan Siswa
                            </h2>
                        </div>

                        {course.reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.reviews.map((review: any) => (
                                    <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            {review.user.avatarUrl ? (
                                                <img src={review.user.avatarUrl} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex justify-center items-center text-blue-700 font-bold">
                                                    {review.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{review.user.name}</p>
                                                <div className="flex text-yellow-400 text-xs">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={i < review.rating ? "fa-solid fa-star" : "fa-regular fa-star text-gray-300"}></i>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment || "Kelas yang sangat bermanfaat!"}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                <i className="fa-regular fa-star text-gray-300 text-4xl mb-3"></i>
                                <p className="text-gray-500">Belum ada ulasan untuk kelas ini. Jadilah yang pertama!</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
