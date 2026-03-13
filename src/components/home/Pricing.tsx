"use client";

import { usePricingPlans } from "@/hooks/use-dashboard";
import { useSubscribe } from "@/hooks/use-subscribe";

export default function Pricing() {
  const { plans: rawPlans, isLoading: loading } = usePricingPlans();
  const { processPlans, formatCurrency, handleSubscribe } = useSubscribe();
  
  const plans = processPlans(rawPlans);

  return (
    <div className="w-full min-h-screen flex justify-center items-center pt-10 md:pb-32 pb-16">
      <div className="flex flex-col w-11/12 md:w-10/12 justify-center items-center h-full">
        <div className="flex flex-col text-center items-center justify-center">
          <span className="text-gradient-1 text-lg font-medium">Berlangganan</span>
          <h1 className="text-black text-2xl md:text-3xl font-semibold mt-2">
            Langkah Terbaik untuk <br /> Memaksimalkan Potensi Belajarmu.
          </h1>
        </div>

        <div className="w-full min-h-[35rem] flex flex-col md:flex-row justify-center items-center gap-6 mt-12 flex-wrap">
          {loading ? (
            <div className="flex justify-center items-center w-full h-40">
              <div className="text-xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 text-transparent bg-clip-text animate-pulse">
                Memuat paket langganan...
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex justify-center items-center w-full h-40">
              <div className="text-lg text-gray-500">
                Paket belum tersedia saat ini.
              </div>
            </div>
          ) : (
            plans.map((plan, index) => {
              const isHighlighted = plan.tier === 'MURID' || (plans.length === 2 && index === 1) || (plans.length === 3 && index === 1);
              
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col px-6 py-8 max-w-80 w-80 shadow-md rounded-2xl justify-between relative transition-transform hover:-translate-y-1 duration-300 ${isHighlighted
                      ? 'md:h-[35rem] h-auto bg-gradient-1 shadow-lg'
                      : 'md:h-[32rem] h-auto bg-white'
                    }`}
                >
                  <div className="flex flex-col">
                    <h1 className={`font-bold text-2xl mb-2 ${isHighlighted ? 'text-white' : 'text-black'}`}>
                      {plan.name}
                    </h1>
                    <p className={`text-sm mb-4 h-10 line-clamp-2 leading-relaxed ${isHighlighted ? 'text-white opacity-80' : 'text-gray-500'}`}>
                      {plan.description}
                    </p>
                    <p className={`font-semibold text-2xl mb-1 ${isHighlighted ? 'text-white' : 'text-gradient-1'}`}>
                      Rp . {formatCurrency(plan.monthlyPrice)}{' '}
                      <span className={`text-sm ${isHighlighted ? 'text-gray-200' : 'text-gray-400'}`}>
                        /Bulan
                      </span>
                    </p>
                  </div>

                  <ul
                    className={`font-normal mt-6 mb-8 text-base flex flex-col gap-y-3 ${isHighlighted ? 'text-white h-full md:h-64' : 'text-[#101010] h-full md:h-64'
                      } overflow-y-auto scrollbar-hide`}
                  >
                    {Array.isArray(plan.features) ? plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-x-3"
                      >
                        <i className="fa-solid fa-check mt-1 text-sm"></i>
                        <p className="leading-snug text-sm">
                          {feature}
                        </p>
                      </li>
                    )) : (
                      <li className="flex items-start gap-x-3">
                        <i className="fa-solid fa-check mt-1 text-sm"></i>
                        <p className="leading-snug text-sm">{plan.features}</p>
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full rounded-lg font-semibold flex items-center justify-center h-12 mt-auto transition-transform active:scale-95 ${isHighlighted
                        ? 'bg-white text-gradient-1 shadow-md hover:bg-gray-50'
                        : 'bg-gradient-1 text-white shadow-md hover:opacity-90'
                      }`}
                  >
                    Pilih
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
