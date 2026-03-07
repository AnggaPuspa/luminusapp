'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Apakah kursus ini cocok untuk pemula tanpa pengalaman coding?',
    answer: 'Ya, tentu saja! Kami memiliki kursus yang dirancang khusus untuk pemula. Anda akan belajar dari dasar, mulai dari konsep pemrograman dasar hingga praktik coding yang lebih kompleks.',
  },
  {
    question: 'Apakah saya mendapatkan sertifikat setelah menyelesaikan kursus?',
    answer: 'Ya, setelah menyelesaikan kursus dan lulus evaluasi, Anda akan mendapatkan sertifikat elektronik yang dapat digunakan untuk menambah nilai pada portofolio Anda.',
  },
  {
    question: 'Bagaimana jika saya mengalami kesulitan selama belajar?',
    answer: 'Jika Anda mengalami kesulitan, Anda dapat bergabung di forum diskusi komunitas kami atau menghubungi mentor kami.',
  },
  {
    question: 'Apakah ada mentor yang membantu selama proses belajar?',
    answer: 'Ya, untuk kursus premium, Anda akan mendapatkan dukungan dari mentor berpengalaman yang siap membantu menjawab pertanyaan dan memberikan feedback.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-blue-primary flex flex-col items-center py-24 justify-center">
      <div className="w-10/12 flex flex-col h-full items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="bg-gradient-to-r from-gradient-1 to-gradient-2 text-transparent bg-clip-text text-lg md:text-lg font-medium">
            FAQ
          </span>
          <h1 className="font-semibold text-2xl md:text-3xl text-white mt-2">
            Pertanyaan yang Sering Diajukan
          </h1>
        </div>

        <div className="w-full h-auto p-3 flex items-center justify-center">
          <div className="accordion w-full max-w-3xl mt-6 text-white flex flex-col items-center">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="accordion-content w-full my-2 rounded-lg bg-blue-second overflow-hidden"
              >
                <header
                  className="flex items-center min-h-12 px-6 py-4 cursor-pointer transition-all duration-200 gap-5"
                  onClick={() => toggleAccordion(index)}
                >
                  <i className={`fa-solid ${openIndex === index ? 'fa-minus' : 'fa-plus'} text-2xl`}></i>
                  <span className="title text-base md:text-lg font-medium">{faq.question}</span>
                </header>
                <p
                  className={`description opacity-60 text-sm font-normal pl-16 md:pl-14 pr-4 transition-all duration-200 overflow-hidden ${
                    openIndex === index ? 'h-auto mb-4 pb-4' : 'h-0'
                  }`}
                >
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
