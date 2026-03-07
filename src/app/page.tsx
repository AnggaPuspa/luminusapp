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

export default function Home() {
  return (
    <>
      <ScrollButton />
      <Navbar />
      <Hero />
      <About />
      <Courses />
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
