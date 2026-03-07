'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CheckoutButton from '@/components/common/CheckoutButton';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
  }).format(price);
}

export default function Courses({ courses }: { courses: any[] }) {
  return (
    <section className="blog-section" id="kursus-section">
      <div className="blog-container">
        <div className="blog-header">
          <div className="blog-left">
            <h2>Kursus</h2>
            <p>Kursus Terpopuler</p>
          </div>
          <div className="blog-right">
            <Link href="/kursus">
              <button className="hover-button">Lihat Semua</button>
            </Link>
          </div>
        </div>

        <div className="w-full relative swiper-container">
          <Swiper
            modules={[Navigation]}
            spaceBetween={40}
            slidesPerView={1}
            centeredSlides={true}
            loop={true}
            navigation={{
              nextEl: '.next-buttom',
              prevEl: '.prev-buttom',
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
            className="blog-cards"
          >
            {courses.map((course) => (
              <SwiperSlide key={course.id}>
                <div className="blog-card">
                  <Image
                    src={course.thumbnailUrl || "/images/lmsjs.png"}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-[90%] mx-auto h-auto object-cover rounded-xl mt-4"
                  />
                  <div className="blog-content">
                    <div className="flex gap-4 mt-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-gradient-1"></i>
                        <span>{course.duration} jam</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-video text-gradient-1"></i>
                        <span>Materi</span>
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => {
                          const avgRating = course.reviews && course.reviews.length > 0
                            ? course.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / course.reviews.length
                            : 0;

                          if (i < Math.floor(avgRating)) return <i key={i} className="fa-solid fa-star"></i>;
                          if (i === Math.floor(avgRating) && avgRating % 1 >= 0.5) return <i key={i} className="fa-solid fa-star-half-stroke"></i>;
                          return <i key={i} className="fa-regular fa-star text-gray-300"></i>;
                        })}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {course.reviews && course.reviews.length > 0
                          ? (course.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / course.reviews.length).toFixed(1)
                          : "0.0"}
                        <span className="text-gray-400 ml-1">({course.reviews?.length || 0})</span>
                      </span>
                    </div>

                    <Link href={`/kursus/${course.slug}`}>
                      <p className="text-lg font-medium mt-3 text-black hover:text-blue-600 transition-colors line-clamp-2">{course.title}</p>
                    </Link>

                    <div className="mt-4">
                      {course.discountedPrice ? (
                        <>
                          <span className="line-through text-[#E63946]">
                            Rp. {formatPrice(course.originalPrice)}
                          </span>
                          <span className="font-semibold text-lg ml-2">
                            Rp. {formatPrice(course.discountedPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-lg ml-2">
                          Rp. {formatPrice(course.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-8">
                      <CheckoutButton
                        courseId={course.id}
                        title={course.title}
                        originalPrice={course.originalPrice}
                        discountedPrice={course.discountedPrice}
                        className="px-6 py-3 font-medium rounded-lg bg-[#696EFF] text-white inline-block"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-button-prev prev-buttom"></div>
          <div className="swiper-button-next next-buttom"></div>
        </div>
      </div>
    </section>
  );
}
