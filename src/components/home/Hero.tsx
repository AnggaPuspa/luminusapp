import Link from 'next/link';
import Image from 'next/image';
import { HeroVideoModal } from './HeroVideoModal';

export default function Hero() {
  return (
    <section className="min-h-screen w-full overflow-hidden flex flex-col items-center">
      <div className="bg-blue-primary h-[80vh] lg:h-[90vh] w-full relative md:overflow-hidden flex justify-center items-center header-responsive">
        <div className="w-[80%] h-full flex items-center justify-start header-container-responsive">
          <div className="w-[60%] text-white header-left-responsive">
            <h1 className="text-3xl md:text-3xl lg:text-4xl font-bold mb-4 w-[80%]">
              Tingkatkan
              <span className="bg-gradient-to-r from-gradient-1 to-gradient-2 text-white px-3 py-2 rounded-md mt-1 md:mt-0 ml-1 md:mb-2 mb-1 inline-block md:-rotate-0">
                Kemampuan
              </span>
              Wujudkan Masa Depan.
            </h1>
            <p className="mb-8 opacity-50 w-[70%]">
              Belajar coding dari nol hingga mahir bersama kami! Akses kursus online interaktif kapan saja, di mana saja
            </p>
            <div className="flex gap-4 items-center">
              <Link
                href="/kursus"
                className="px-8 py-2 bg-gradient-to-r from-gradient-1 to-gradient-2 rounded-md font-semibold header-hover-button"
              >
                Jelajahi
              </Link>
              <HeroVideoModal />
            </div>
          </div>
          <div className="w-[40%] flex justify-center items-start relative header-right-responsive">
            <Image
              src="/images/icon_2.svg"
              alt="icon"
              width={140}
              height={140}
              className="absolute left-0 top-[100px] -translate-x-16 animation-icon"
            />
            <Image
              src="/images/icon_1.svg"
              alt="icon"
              width={140}
              height={140}
              className="absolute right-0 top-[150px] translate-x-8 rotate-12 animation-icon-2"
            />
            <Image
              src="/images/heropage.png"
              alt="hero"
              width={500}
              height={500}
              className="w-full aspect-square object-contain mt-24"
            />
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="w-full mt-2 md:mt-0 md:w-11/12 lg:w-10/12 md:h-24 md:-translate-y-14 bg-white md:rounded-[40px] relative z-10 md:shadow-[0px_8px_17px_0px_rgba(0,_0,_0,_0.1)] flex justify-center items-center overflow-hidden">
        <div className="flex items-center justify-start w-full animate-scroll md:justify-evenly whitespace-nowrap">
          <p className="hidden md:block font-semibold text-black opacity-50 md:text-base lg:text-lg px-4 md:px-0">
            Supported by
          </p>
          <Image src="/images/google.png" alt="google" width={24} height={24} className="w-6 h-auto object-contain mx-4 md:mx-2 lg:mx-0" />
          <Image src="/images/aws.png" alt="aws" width={56} height={24} className="w-14 h-auto object-contain mx-4 md:mx-2 lg:mx-0" />
          <Image src="/images/coursera.png" alt="coursera" width={56} height={24} className="w-14 h-auto object-contain mx-4 md:mx-2 lg:mx-0" />
          <Image src="/images/udemy.png" alt="udemy" width={64} height={24} className="w-16 h-auto object-contain mx-4 md:mx-2 lg:mx-0" />
          <Image src="/images/zoom.png" alt="zoom" width={64} height={24} className="w-16 h-auto object-contain mx-4 md:mx-2 lg:mx-0" />
          {/* Duplicate for mobile scroll */}
          <Image src="/images/google.png" alt="google" width={24} height={24} className="w-6 h-auto object-contain mx-4 md:hidden" />
          <Image src="/images/aws.png" alt="aws" width={56} height={24} className="w-14 h-auto object-contain mx-4 md:hidden" />
          <Image src="/images/coursera.png" alt="coursera" width={64} height={24} className="w-16 h-auto object-contain mx-4 md:hidden" />
          <Image src="/images/udemy.png" alt="udemy" width={64} height={24} className="w-16 h-auto object-contain mx-4 md:hidden" />
          <Image src="/images/zoom.png" alt="zoom" width={64} height={24} className="w-16 h-auto object-contain mx-4 md:hidden" />
        </div>
      </div>
    </section>
  );
}
