const plans = [
  {
    name: 'Biasa',
    price: '0',
    period: '/Bulan',
    features: [
      { text: 'Akses Materi Dasar', available: true },
      { text: 'Grup Diskusi', available: true },
      { text: 'Progress Tracking', available: true },
      { text: 'Akses Materi Lanjutan', available: false },
      { text: 'Konsultasi Dengan Mentor', available: false },
      { text: 'Akses Selamanya', available: false },
      { text: 'Kelas Live Eksklusif', available: false },
    ],
    highlighted: false,
  },
  {
    name: 'Murid',
    price: '150,000',
    period: '/Bulan',
    features: [
      { text: 'Akses Materi Dasar', available: true },
      { text: 'Grup Diskusi', available: true },
      { text: 'Progress Tracking', available: true },
      { text: 'Akses Materi Lanjutan', available: true },
      { text: 'Konsultasi Dengan Mentor', available: true },
      { text: 'Akses Selamanya', available: false },
      { text: 'Kelas Live Eksklusif', available: false },
    ],
    highlighted: true,
  },
  {
    name: 'Profesional',
    price: '1.500,000',
    period: '/Pengguna',
    features: [
      { text: 'Akses Materi Dasar', available: true },
      { text: 'Grup Diskusi', available: true },
      { text: 'Progress Tracking', available: true },
      { text: 'Akses Materi Lanjutan', available: true },
      { text: 'Konsultasi Dengan Mentor', available: true },
      { text: 'Akses Selamanya', available: true },
      { text: 'Kelas Live Eksklusif', available: true },
    ],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="w-full min-h-screen flex justify-center items-center pt-10 md:pb-32 pb-16">
      <div className="flex flex-col w-10/12 justify-center items-center h-full">
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-gradient-1 text-lg font-medium">Berlangganan</span>
          <h1 className="text-black text-2xl md:text-3xl font-semibold mt-2">
            Langkah Terbaik untuk <br /> Memaksimalkan Potensi Belajarmu.
          </h1>
        </div>

        <div className="w-full min-h-[35rem] flex flex-col md:flex-row justify-center items-center gap-4 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col px-5 py-3 max-w-80 w-80 shadow-md rounded-2xl justify-between ${plan.highlighted
                  ? 'max-h-[35rem] h-[35rem] bg-gradient-1 shadow-lg'
                  : 'max-h-[30rem] h-[28rem] bg-white'
                }`}
            >
              <div className="flex flex-col">
                <h1 className={`font-bold text-2xl mb-1 ${plan.highlighted ? 'text-white' : 'text-black'}`}>
                  {plan.name}
                </h1>
                <p className={`font-semibold ${plan.highlighted ? 'text-white' : 'text-gradient-1'}`}>
                  Rp . {plan.price}{' '}
                  <span className={`text-sm ${plan.highlighted ? 'text-gray-200' : 'text-gray-400'}`}>
                    {plan.period}
                  </span>
                </p>
              </div>

              <ul
                className={`font-normal text-base flex flex-col gap-y-2 ${plan.highlighted ? 'text-white h-80' : 'text-[#101010]'
                  }`}
              >
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className={`flex items-center gap-x-2 ${!feature.available ? (plan.highlighted ? 'opacity-40' : 'text-gray-400') : ''
                      }`}
                  >
                    <i className="fa-solid fa-check"></i>
                    <p className={!feature.available ? 'line-through decoration-1' : ''}>
                      {feature.text}
                    </p>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-lg font-semibold flex items-center justify-center h-11 mb-2 ${plan.highlighted
                    ? 'bg-white text-gradient-1'
                    : 'bg-gradient-1 text-white'
                  }`}
              >
                Pilih
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
