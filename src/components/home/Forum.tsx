import Link from 'next/link';
import Image from 'next/image';



export default function Forum({ reviews = [] }: { reviews?: any[] }) {
  // Use real reviews if provided, otherwise fallback to empty state
  const displayReviews = reviews.length > 0 ? reviews : [];

  return (
    <div className="w-full md:h-[80vh] h-[50vh] flex flex-col justify-center items-center">
      <div className="h-full w-10/12 grid xl:grid-cols-[1fr_2fr] lg:grid-cols-2">
        <div className="flex flex-col gap-y-2 w-full justify-center pt-14">
          <span className="text-gradient-1 text-sm">Forum</span>
          <h1 className="text-2xl md:text-3xl font-semibold">Diskusi Komunitas</h1>
          <p className="text-gray-500 w-10/12">
            Ajukan pertanyaan, berbagi wawasan, dan diskusikan materi dengan komunitas untuk memperdalam ilmu dan wawasan kamu
          </p>
          <Link href="/kursus">
            <button className="rounded-lg font-semibold flex items-center justify-center px-12 py-2 w-fit bg-gradient-1 text-white mt-5 hover-button">
              Mulai
            </button>
          </Link>
        </div>

        <div className="h-full md:hidden hidden xl:grid xl:grid-cols-2 lg:grid-cols-1 justify-center items-center gap-x-2 w-full overflow-hidden">
          <div className="w-full h-full flex justify-end xl:justify-end overflow-y-hidden">
            <div className="flex flex-col gap-y-2 cardUp xl:w-fit lg:w-full">
              {displayReviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className="w-full xl:max-w-72 xl:aspect-square lg:aspect-video rounded-2xl bg-white flex flex-col p-6 shadow-sm border border-gray-50"
                >
                  <div className="w-full h-[70%]">
                    <p className="w-full text-[#101010] font-base opacity-60 text-lg line-clamp-4">"{review.comment}"</p>
                  </div>
                  <div className="w-full h-[30%] flex items-center">
                    {review.user?.avatarUrl ? (
                         <Image src={review.user.avatarUrl} alt="profile" width={40} height={40} className="w-10 aspect-square rounded-full object-cover" />
                    ) : (
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                             {review.user?.name?.charAt(0) || 'U'}
                         </div>
                    )}
                    <div className="h-full flex flex-col justify-center pl-5 min-w-0">
                      <h1 className="text-lg font-semibold truncate text-[#1a1a1a]">{review.user?.name || 'Siswa'}</h1>
                      <div className="flex text-yellow-500 text-[10px] mt-1">
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
          <div className="w-full h-full xl:flex lg:hidden md:hidden items-start overflow-y-hidden">
            <div className="flex flex-col gap-y-2 cardDown">
              {displayReviews.map((review, index) => (
                <div
                  key={index}
                  className="w-full max-w-72 aspect-square rounded-2xl bg-white flex flex-col p-6 shadow-sm border border-gray-50"
                >
                  <div className="w-full h-[70%]">
                    <p className="w-full text-[#101010] font-base opacity-60 text-lg line-clamp-4">"{review.comment}"</p>
                  </div>
                  <div className="w-full h-[30%] flex items-center">
                    {review.user?.avatarUrl ? (
                         <Image src={review.user.avatarUrl} alt="profile" width={40} height={40} className="w-10 aspect-square rounded-full object-cover" />
                    ) : (
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                             {review.user?.name?.charAt(0) || 'U'}
                         </div>
                    )}
                    <div className="h-full flex flex-col justify-center pl-5 min-w-0">
                      <h1 className="text-lg font-semibold truncate text-[#1a1a1a]">{review.user?.name || 'Siswa'}</h1>
                      <div className="flex text-yellow-500 text-[10px] mt-1">
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
