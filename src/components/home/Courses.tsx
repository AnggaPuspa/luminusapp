'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Static courses data
const courses = [
  {
    id: 1,
    title: "Introduction to HTML, CSS dan JavaScript",
    image_url: "/images/lmsjs.png",
    duration: 12,
    video_count: 6,
    original_price: 399000,
    discounted_price: 99000,
  },
  {
    id: 2,
    title: "Front-End Website Development",
    image_url: "/images/fe.png",
    duration: 15,
    video_count: 8,
    original_price: 550000,
    discounted_price: 299000,
  },
  {
    id: 3,
    title: "Backend Development with Node.js",
    image_url: "/images/be.png",
    duration: 20,
    video_count: 10,
    original_price: 650000,
    discounted_price: 399000,
  },
  {
    id: 4,
    title: "Cyber Security Fundamentals",
    image_url: "/images/cs.png",
    duration: 18,
    video_count: 9,
    original_price: 599000,
    discounted_price: 349000,
  },
  {
    id: 5,
    title: "Full-Stack JavaScript Mastery",
    image_url: "/images/lmsjs.png",
    duration: 25,
    video_count: 12,
    original_price: 799000,
    discounted_price: 499000,
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
  }).format(price);
}

export default function Courses() {
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
                    src={course.image_url}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-[90%] mx-auto h-auto object-cover rounded-xl"
                  />
                  <div className="blog-content">
                    <div className="flex gap-4 mt-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-gradient-1"></i>
                        <span>{course.duration} jam</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-video text-gradient-1"></i>
                        <span>{course.video_count} Modul</span>
                      </div>
                    </div>

                    <p className="text-lg font-medium mt-4 text-black">{course.title}</p>

                    <div className="mt-4">
                      {course.discounted_price ? (
                        <>
                          <span className="line-through text-[#E63946]">
                            Rp. {formatPrice(course.original_price)}
                          </span>
                          <span className="font-semibold text-lg ml-2">
                            Rp. {formatPrice(course.discounted_price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-lg ml-2">
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
