"use client";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import "@/styles/common.css";
import { usePricingPlans } from "@/hooks/use-dashboard";
import { useSubscribe } from "@/hooks/use-subscribe";

export default function PricingPage() {
    const { plans: rawPlans, isLoading: loading } = usePricingPlans();
    const {
        billingCycle,
        setBillingCycle,
        processPlans,
        formatCurrency,
        getCurrentPrice,
        handleSubscribe,
    } = useSubscribe();

    const plans = processPlans(rawPlans);

    return (
        <div className="bg-[#f1f2f6] min-h-screen">
            <Navbar />

            <div className="w-full min-h-screen flex flex-col justify-start items-center pt-32 md:pb-32 pb-16">
                <div className="flex flex-col w-11/12 md:w-10/12 justify-center items-center h-full">

                    {/* Header Group */}
                    <div className="flex flex-col text-center items-center justify-center">
                        <span className="text-gradient-1 text-lg font-medium">Berlangganan</span>
                        <h1 className="text-black text-2xl md:text-3xl font-semibold mt-2">
                            Langkah Terbaik untuk <br className="hidden md:block" /> Memaksimalkan Potensi Belajarmu.
                        </h1>
                        <p className="text-[#101010] opacity-60 mt-4 max-w-2xl text-center">
                            Investasi terbaik untuk karir kodemu. Pilih langganan fleksibel atau beli kelas satuan.
                        </p>
                    </div>

                    {/* Billing Toggle Indicator */}
                    <div className="flex items-center justify-center gap-4 mt-8 bg-white border border-gray-200 p-1.5 rounded-full shadow-sm">
                        <button
                            onClick={() => setBillingCycle('MONTHLY')}
                            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${billingCycle === 'MONTHLY' ? 'bg-gradient-1 text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                        >
                            Bulanan
                        </button>
                        <button
                            onClick={() => setBillingCycle('YEARLY')}
                            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all relative ${billingCycle === 'YEARLY' ? 'bg-gradient-1 text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                        >
                            Tahunan
                            <span className="absolute -top-3 -right-3 text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-md shadow-sm">
                                Hemat
                            </span>
                        </button>
                    </div>

                    {/* Pricing Cards Container */}
                    <div className="w-full min-h-[35rem] flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 mt-12 flex-wrap">
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
                                const currentPrice = getCurrentPrice(plan);

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
                                                Rp . {formatCurrency(currentPrice)}{' '}
                                                <span className={`text-sm ${isHighlighted ? 'text-gray-200' : 'text-gray-400'}`}>
                                                    /Bulan
                                                </span>
                                            </p>

                                            {billingCycle === 'YEARLY' && plan.yearlyPrice && (
                                                <p className={`text-xs font-semibold mb-2 ${isHighlighted ? 'text-green-200' : 'text-green-500'}`}>
                                                    (Total Rp. {formatCurrency(plan.yearlyPrice)} /tahun)
                                                </p>
                                            )}
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
                                            Pilih Paket
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pay Per Course Alternative */}
                    {!loading && (
                        <div className="w-full max-w-4xl mx-auto mt-20 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-black mb-2">Tertarik belajar satu kelas saja?</h2>
                                <p className="text-gray-500 max-w-lg">Beli kelas favoritmu secara satuan dengan akses berlaku seumur hidup (lifetime) tanpa perlu berlangganan.</p>
                            </div>
                            <Link
                                href="/kursus"
                                className="shrink-0 px-8 py-3.5 border-2 border-[#696EFF] text-[#696EFF] font-semibold rounded-lg hover:bg-[#696EFF] hover:text-white transition-all"
                            >
                                Lihat Katalog Kelas
                            </Link>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </div>
    );
}
