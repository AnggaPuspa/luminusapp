import {
  Navbar,
  Hero,
  About,
  Courses,
  RoadMap,
  Testimonials,
  Pricing,
  FAQ,
  Forum,
  CTA,
  Footer,
  ScrollButton,
} from '@/components';

// Home page specific styles
import '@/styles/home.css';
import '@/styles/common.css';

import prisma from "@/lib/prisma";

export const revalidate = 60; // ISR: cache 60 detik

export default async function Home() {
  const publishedCourses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      originalPrice: true,
      discountedPrice: true,
      duration: true,
      reviews: { select: { rating: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 6, // Show latest 6 on home
  }) as any;

  const topReviews = await prisma.courseReview.findMany({
    where: {
        rating: { gte: 4 }, // Only fetch 4 or 5 star reviews
        comment: { not: "" }
    },
    select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
            select: {
                name: true,
                avatarUrl: true
            }
        }
    },
    orderBy: {
        createdAt: 'desc'
    },
    take: 6 // Show latest 6 top reviews
  });

  return (
    <>
      <ScrollButton />
      <Navbar />
      <Hero />
      <About />
      <Courses courses={publishedCourses} />
      <RoadMap />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Forum reviews={topReviews} />
      <CTA />
      <Footer />
    </>
  );
}
