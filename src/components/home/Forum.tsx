import Link from 'next/link';
import Image from 'next/image';



export default function Forum({ reviews = [] }: { reviews?: any[] }) {
  // Triple the reviews to ensure we have enough content for a seamless loop
  const duplicatedReviews = reviews.length > 0 
    ? [...reviews, ...reviews, ...reviews] 
    : [];

  return (
    <div className="w-full md:h-[80vh] h-[50vh] flex flex-col justify-center items-center">
      <div className="h-full w-10/12 grid xl:grid-cols-[1fr_2fr] lg:grid-cols-2">
        <div className="flex flex-col gap-y-2 w-full justify-center pt-14">
          <span className="text-gradient-1 text-sm font-semibold">Forum</span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Diskusi Komunitas</h1>
          <p className="text-gray-500 w-11/12 text-lg leading-relaxed">
            Ajukan pertanyaan, berbagi wawasan, dan diskusikan materi dengan komunitas untuk memperdalam ilmu dan wawasan kamu
          </p>
          <Link href="/kursus">
            <button className="rounded-xl font-semibold flex items-center justify-center px-10 py-3 w-fit bg-gradient-1 text-white mt-8 hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 transform hover:-translate-y-1">
              Mulai Sekarang
            </button>
          </Link>
        </div>

        <div className="h-full md:hidden hidden xl:grid xl:grid-cols-2 lg:grid-cols-1 justify-center items-center gap-x-6 w-full overflow-hidden relative">
          {/* Subtle gradient overlays for smooth fade at top/bottom */}
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#f8f9fa] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#f8f9fa] to-transparent z-10 pointer-events-none"></div>

          <div className="w-full h-full flex justify-end overflow-hidden">
            <div className="flex flex-col gap-y-4 animate-scroll-up px-2 hover:pause-animation">
              {duplicatedReviews.map((review, index) => (
                <div
                  key={`up-${index}`}
                  className="w-full xl:w-72 rounded-2xl bg-white flex flex-col p-6 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-full mb-4">
                    <p className="w-full text-gray-600 font-medium text-base line-clamp-4 italic leading-relaxed">"{review.comment}"</p>
                  </div>
                  <div className="mt-auto flex items-center">
                    {review.user?.avatarUrl ? (
                         <Image src={review.user.avatarUrl} alt="profile" width={40} height={40} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-50" />
                    ) : (
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                             {review.user?.name?.charAt(0) || 'U'}
                         </div>
                    )}
                    <div className="flex flex-col justify-center pl-4 min-w-0">
                      <h1 className="text-base font-bold truncate text-gray-900">{review.user?.name || 'Siswa'}</h1>
                      <div className="flex text-yellow-400 text-[10px] gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                              <i key={star} className={star <= (review.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-full xl:flex lg:hidden md:hidden items-start overflow-hidden">
            <div className="flex flex-col gap-y-4 animate-scroll-down px-2 hover:pause-animation">
              {duplicatedReviews.map((review, index) => (
                <div
                  key={`down-${index}`}
                  className="w-full xl:w-72 rounded-2xl bg-white flex flex-col p-6 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-full mb-4">
                    <p className="w-full text-gray-600 font-medium text-base line-clamp-4 italic leading-relaxed">"{review.comment}"</p>
                  </div>
                  <div className="mt-auto flex items-center">
                    {review.user?.avatarUrl ? (
                         <Image src={review.user.avatarUrl} alt="profile" width={40} height={40} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-50" />
                    ) : (
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                             {review.user?.name?.charAt(0) || 'U'}
                         </div>
                    )}
                    <div className="flex flex-col justify-center pl-4 min-w-0">
                      <h1 className="text-base font-bold truncate text-gray-900">{review.user?.name || 'Siswa'}</h1>
                      <div className="flex text-yellow-400 text-[10px] gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                              <i key={star} className={star <= (review.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                          ))}
                      </div>
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
