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

export const dynamic = 'force-dynamic';

export default async function Home() {
  const publishedCourses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null
    },
    orderBy: { createdAt: 'desc' },
    take: 6, // Show latest 6 on home
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
      <Forum />
      <CTA />
      <Footer />
    </>
  );
}
