import Link from 'next/link';
import Image from 'next/image';

const forumCards = [
  { text: '" Materinya lengkap dan mudah dipahami. Sangat cocok untuk pemula hingga mahir!. "', name: 'Angga Puspa', role: 'Full Stack Javascript' },
  { text: '" Materinya lengkap dan mudah dipahami. Sangat cocok untuk pemula hingga mahir!. "', name: 'Angga Puspa', role: 'Full Stack Javascript' },
  { text: '" Materinya lengkap dan mudah dipahami. Sangat cocok untuk pemula hingga mahir!. "', name: 'Angga Puspa', role: 'Full Stack Javascript' },
  { text: '" Materinya lengkap dan mudah dipahami. Sangat cocok untuk pemula hingga mahir!. "', name: 'Angga Puspa', role: 'Full Stack Javascript' },
];

export default function Forum() {
  return (
    <div className="w-full md:h-[80vh] h-[50vh] flex flex-col justify-center items-center">
      <div className="h-full w-10/12 grid xl:grid-cols-[1fr_2fr] lg:grid-cols-2">
        <div className="flex flex-col gap-y-2 w-full justify-center pt-14">
          <span className="text-gradient-1 text-sm">Forum</span>
          <h1 className="text-2xl md:text-3xl font-semibold">Diskusi Komunitas</h1>
          <p className="text-gray-500 w-10/12">
            Ajukan pertanyaan, berbagi wawasan, dan diskusikan materi dengan komunitas untuk memperdalam ilmu dan wawasan kamu
          </p>
          <Link href="/forum">
            <button className="rounded-lg font-semibold flex items-center justify-center px-12 py-2 w-fit bg-gradient-1 text-white mt-5 hover-button">
              Mulai
            </button>
          </Link>
        </div>

        <div className="h-full md:hidden hidden xl:grid xl:grid-cols-2 lg:grid-cols-1 justify-center items-center gap-x-2 w-full overflow-hidden">
          <div className="w-full h-full flex justify-end xl:justify-end overflow-y-hidden">
            <div className="flex flex-col gap-y-2 cardUp xl:w-fit lg:w-full">
              {forumCards.map((card, index) => (
                <div
                  key={index}
                  className="w-full xl:max-w-72 xl:aspect-square lg:aspect-video rounded-2xl bg-white flex flex-col p-6"
                >
                  <div className="w-full h-[70%]">
                    <p className="w-full text-[#101010] font-base opacity-60 text-lg">{card.text}</p>
                  </div>
                  <div className="w-full h-[30%] flex items-center">
                    <Image src="/images/dummyFaq.png" alt="profile" width={40} height={40} className="w-10 aspect-square" />
                    <div className="h-full flex flex-col justify-center pl-5">
                      <h1 className="text-lg">{card.name}</h1>
                      <p className="text-gray-400 opacity-80">{card.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-full xl:flex lg:hidden md:hidden items-start overflow-y-hidden">
            <div className="flex flex-col gap-y-2 cardDown">
              {forumCards.map((card, index) => (
                <div
                  key={index}
                  className="w-full max-w-72 aspect-square rounded-2xl bg-white flex flex-col p-6"
                >
                  <div className="w-full h-[70%]">
                    <p className="w-full text-[#101010] font-base opacity-60 text-lg">{card.text}</p>
                  </div>
                  <div className="w-full h-[30%] flex items-center">
                    <Image src="/images/dummyFaq.png" alt="profile" width={40} height={40} className="w-10 aspect-square" />
                    <div className="h-full flex flex-col justify-center pl-5">
                      <h1 className="text-lg">{card.name}</h1>
                      <p className="text-gray-400 opacity-80">{card.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
