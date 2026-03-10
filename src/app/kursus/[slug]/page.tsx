import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CourseDetailCTA from "@/components/common/CourseDetailCTA";
import { Navbar, Footer } from "@/components";
import { getCourseBySlug } from "@/services/course.service";

export const revalidate = 3600; // ISR: cache 1 hour

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

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
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Content Section - Flat White Minimalist Layout */}
            <div className="w-[85%] md:w-[80%] mx-auto pt-32 pb-24 text-black flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

                {/* Left Column (Hero Text, Kurikulum, Reviews) */}
                <div className="w-full lg:w-[60%] space-y-12">

                    {/* Hero Header Area */}
                    <div>
                        <Link href="/kursus" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-primary mb-6 transition font-medium">
                            <i className="fa-solid fa-arrow-left mr-2"></i> Kembali ke Katalog
                        </Link>

                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-gray-900 tracking-tight">
                            {course.title}
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl font-normal">
                            {course.description || "Tingkatkan skill Anda dengan materi terstruktur dari praktisi ahli."}
                        </p>
                    </div>

                    {/* Kurikulum */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            Kurikulum Kelas
                        </h2>

                        <div className="space-y-3">
                            {course.modules.length > 0 ? course.modules.map((module: any, idx: number) => (
                                <div key={module.id} className="bg-[#f9fafb] rounded-xl overflow-hidden hover:bg-gray-50 transition duration-300">
                                    <div className="p-4 md:p-5 font-semibold text-gray-800 flex flex-col md:flex-row justify-between md:items-center gap-2 cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-400 font-medium">{idx + 1}.</span>
                                            <span className="text-base group-hover:text-blue-primary transition">{module.title}</span>
                                        </div>
                                        <i className="fa-solid fa-chevron-down text-gray-400 text-sm group-hover:text-blue-primary transition"></i>
                                    </div>
                                    <div className="px-5 pb-4 md:px-12 md:pb-5">
                                        {module.lessons.map((lesson: any, lIdx: number) => (
                                            <div key={lesson.id} className="flex items-center justify-between py-2 border-t border-gray-100 first:border-0 mt-2 first:mt-0">
                                                <div className="flex items-center gap-3 text-gray-500 text-sm hover:text-blue-primary transition cursor-pointer">
                                                    <i className="fa-regular fa-circle-play"></i>
                                                    <span>{lesson.title}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium">{lesson.duration} mnt</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 bg-[#f9fafb] rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 italic">Kurikulum sedang disusun.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Ulasan Siswa */}
                    <section id="reviews" className="pt-8 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                                Ulasan Siswa
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                                <div className="flex text-yellow-400 text-xs">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={`fa-solid ${i < Math.floor(avgRating) ? 'fa-star' : (i === Math.floor(avgRating) && avgRating % 1 >= 0.5 ? 'fa-star-half-stroke' : 'fa-star text-gray-200')}`}></i>
                                    ))}
                                </div>
                                <span className="text-gray-500 text-sm ml-1">({course.reviews.length})</span>
                            </div>
                        </div>

                        {course.reviews.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {course.reviews.map((review: any) => (
                                    <div key={review.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            {review.user.avatarUrl ? (
                                                <img src={review.user.avatarUrl} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex justify-center items-center text-blue-primary font-bold">
                                                    {review.user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{review.user.name}</p>
                                                <div className="flex text-yellow-400 text-[10px] mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={i < review.rating ? "fa-solid fa-star" : "fa-regular fa-star text-gray-200"}></i>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">"{review.comment || "Kelas yang sangat bermanfaat!"}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">Belum ada ulasan untuk kelas ini.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column (Sidebar Cards) */}
                <div className="w-full lg:w-[40%] flex flex-col gap-6 lg:sticky lg:top-28">

                    {/* Unified Information & CTA Card */}
                    <div className="bg-white rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden relative z-30 transition-all duration-300">
                        {/* Course Cover Image */}
                        <div className="w-full aspect-video bg-gray-50 relative border-b border-gray-100">
                            <Image
                                src={course.thumbnailUrl || "/images/lmsjs.png"}
                                alt={course.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                {course.title}
                            </h3>

                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                {course.description ? course.description.substring(0, 150) + '...' : "Tingkatkan skill Anda dengan materi terstruktur dari praktisi ahli."}
                            </p>

                            <div className="mb-8">
                                <CourseDetailCTA
                                    courseId={course.id}
                                    courseSlug={course.slug}
                                    courseTitle={course.title}
                                    originalPrice={course.originalPrice}
                                    discountedPrice={course.discountedPrice}
                                />
                            </div>

                            {/* Features / Details List (Real Data Driven) */}
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Detail & Fasilitas Kelas</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-4 text-sm text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-primary">
                                            <i className="fa-regular fa-circle-play text-xs"></i>
                                        </div>
                                        <span><span className="font-semibold text-gray-900">{course.modules.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0)}</span> Materi video</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-sm text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-primary">
                                            <i className="fa-regular fa-clock text-xs"></i>
                                        </div>
                                        <span><span className="font-semibold text-gray-900">{course.duration} Jam</span> total durasi</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-sm text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-primary">
                                            <i className="fa-solid fa-list-check text-xs"></i>
                                        </div>
                                        <span><span className="font-semibold text-gray-900">{course.modules.length}</span> Modul terstruktur</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-sm text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-primary">
                                            <i className="fa-solid fa-mobile-screen text-xs"></i>
                                        </div>
                                        <span>Akses penuh selamanya</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <Footer />
        </main>
    );
}
