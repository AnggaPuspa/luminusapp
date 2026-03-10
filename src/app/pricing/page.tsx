"use client";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CTA from "@/components/home/CTA";
import FAQ from "@/components/home/FAQ";
import Link from "next/link";
import "@/styles/common.css";
import "@/styles/home.css";
import { usePricingPlans } from "@/hooks/use-dashboard";
import { useSubscribe } from "@/hooks/use-subscribe";

const pricingFaqs = [
    {
        question: 'Apakah saya bisa membatalkan langganan kapan saja?',
        answer: 'Ya, Anda memiliki kendali penuh. Anda bisa membatalkan perpanjangan otomatis kapan saja dengan mudah melalui menu Pengaturan Langganan di dashboard akun Anda.',
    },
    {
        question: 'Apa bedanya beli kelas satuan dengan berlangganan?',
        answer: 'Berlangganan (Pro/Murid) memberi Anda kebebasan mengakses *semua* kelas di platform kami selama masa aktif. Beli satuan dikhususkan untuk akses permanen seumur hidup pada satu kelas spesifik tanpa perlu berlangganan.',
    },
    {
        question: 'Apakah ada biaya tambahan atau tersembunyi?',
        answer: 'Tidak ada. Harga yang tertera adalah harga final. Semua materi video, modul, kode sumber, dan ujian kelulusan sudah termasuk dalam paket.',
    },
    {
        question: 'Metode pembayaran apa saja yang didukung?',
        answer: 'Kami menerima semua metode pembayaran utama, termasuk Bank Transfer (Virtual Account semua bank), e-Wallet (GoPay, OVO, Dana, ShopeePay), dan Kartu Kredit/Debit melalui payment gateway tersertifikasi.',
    },
];

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
                        <h1 className="text-[30px] font-semibold text-[#101010]">
                            Berlangganan
                        </h1>
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
                </div>
            </div>

            {/* Custom Full Width FAQ from Home Component */}
            {!loading && (
                <FAQ faqsData={pricingFaqs} />
            )}

            {/* CTA Component full width above Footer */}
            {!loading && (
                <CTA
                    title="Siap Mulai Belajar Sekarang? ✨"
                    description="Pilih paket langganan yang sesuai dengan kebutuhanmu dan akses semua materi premium kami tanpa batas."
                    buttonText="Mulai Langganan"
                />
            )}

            <Footer />
        </div>
    );
}
