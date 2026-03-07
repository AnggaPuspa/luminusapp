import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    stars: 5,
    text: 'Belajar coding di sini seru banget! Materinya <b>simpel tapi mendalam</b>, bikin aku ngerti backend dan frontend sekaligus. Nggak nyangka bisa sejauh ini!',
    name: 'John Doe',
    role: 'Full-Stack Javascript',
    image: '/images/profile.jpg',
  },
  {
    id: 2,
    stars: 4,
    text: 'Materinya <b>bagus dan mudah dipahami</b>, tapi ada beberapa bagian yang bisa lebih detail. Overall, pengalaman belajarnya memuaskan dan bermanfaat!',
    name: 'John Doe',
    role: 'Full-Stack Javascript',
    image: '/images/profile.jpg',
  },
  {
    id: 3,
    stars: 5,
    text: 'Pengalamanku belajar di sini luar biasa! Dari nol sampai paham coding backend dan frontend, <b>semuanya disusun rapi dan gampang dipahami</b>. Highly recommended!',
    name: 'John Doe',
    role: 'Full-Stack Javascript',
    image: '/images/profile.jpg',
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-20 flex justify-center items-center">
      <div className="w-10/12 flex flex-col">
        {/* Header */}
        <div>
          <span className="text-[#696EFF] font-medium">Testimoni</span>
          <h1 className="font-semibold text-2xl md:text-3xl mt-2">Apa Kata Mereka ?</h1>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-xl">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Image
                    key={i}
                    src={i < testimonial.stars ? '/images/star.svg' : '/images/star-outline.svg'}
                    alt="star"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p
                className="text-gray-600 mb-8"
                dangerouslySetInnerHTML={{ __html: testimonial.text }}
              />

              {/* Profile */}
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt="profile"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
