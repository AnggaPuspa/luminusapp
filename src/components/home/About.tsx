import Image from 'next/image';

export default function About() {
  return (
    <section className="w-full py-12 flex justify-center items-center md:py-10">
      <div className="w-10/12 flex flex-col lg:flex-row h-full justify-between items-center gap-8 about-section">
        <Image
          src="/images/section2.png"
          alt="about"
          width={528}
          height={528}
          className="hidden md:flex w-half max-w-[33rem] aspect-square about-desktop-image"
        />
        <Image
          src="/images/mobilesection2.png"
          alt="about mobile"
          width={528}
          height={300}
          className="w-full md:hidden flex max-w-[33rem] aspect-auto"
        />
        <div className="w-full lg:w-1/2 h-full text-left p-4 md:p-10 about-text-container">
          <span className="text-gradient-1 font-medium text-lg">Tentang</span>
          <h1 className="font-semibold text-2xl md:text-3xl w-full md:w-full mt-2">
            Penyedia kursus Online Terbaik
          </h1>
          <p className="opacity-50 text-black mt-4 md:mt-6">
            Kami adalah platform terbaik untuk belajar coding online,
            menawarkan materi terkini, bimbingan profesional, dan pengalaman belajar yang interaktif.
          </p>
          <div className="flex flex-col md:flex-row mt-12 md:mt-14 justify-evenly items-center bg-blue-second text-white rounded-2xl shadow-[0px_8px_17px_0px_rgba(0,_0,_0,_0.2)]">
            <div className="w-full md:w-28 py-8 md:aspect-square flex items-center justify-center border-b-2 border-gray-400 md:border-none">
              <div className="flex flex-row md:flex-col md:gap-1 w-10/12 md:w-auto justify-between md:justify-center items-center md:items-baseline text-center">
                <h1 className="text-2xl font-bold">50+</h1>
                <p className="text-base md:text-sm">Instruktur</p>
              </div>
            </div>
            <div className="w-full md:w-28 py-4 md:aspect-square flex items-center justify-center border-b-2 border-gray-400 md:border-none">
              <div className="flex flex-row md:flex-col gap-1 w-10/12 md:w-auto justify-between md:justify-center items-center md:items-baseline text-center">
                <h1 className="text-2xl font-bold">400+</h1>
                <p className="text-base md:text-sm">Kursus</p>
              </div>
            </div>
            <div className="w-full md:w-28 py-4 md:aspect-square flex items-center justify-center">
              <div className="flex flex-row md:flex-col gap-1 w-10/12 md:w-auto justify-between md:justify-center items-center md:items-baseline text-center">
                <h1 className="text-2xl font-bold">40+</h1>
                <p className="text-base md:text-sm">Proyek Nyata</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
