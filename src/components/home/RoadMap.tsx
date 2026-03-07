'use client';

import { useState } from 'react';
import Image from 'next/image';

const roadmapData = {
  android: [
    { title: "Introduction to HTML, CSS dan JavaScript", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 399,000", discountedPrice: "Rp. 99,000" },
    { title: "Front-End Website Development", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Building A Responsive Website Design", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Intermediate JavaScript", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Version Control and Collaboration", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Backend Development", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Modern Frontend Frameworks", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Full-Stack Development", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Advanced Topics in Web Development", image: "/images/lmsjs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
  ],
  frontend: [
    { title: "Pengantar Pengembangan Website", image: "/images/fe.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Advanced CSS", image: "/images/fe.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "JavaScript ES6+", image: "/images/fe.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Frontend Frameworks", image: "/images/fe.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Testing Frontend", image: "/images/fe.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Responsive and Accessibility", image: "/images/fe.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Frontend Optimization", image: "/images/fe.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
  ],
  backend: [
    { title: "Pengantar Pengembangan Backend", image: "/images/be.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Authentication and Authorization", image: "/images/be.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Database Management", image: "/images/be.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Building RESTful APIs", image: "/images/be.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Testing and Debugging", image: "/images/be.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
  ],
  cybersecurity: [
    { title: "Pengantar Cyber Security", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Networking Basics", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Operating Systems and Scripting", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Web Application Security", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Cryptography Basics", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Penetration Testing", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Incident Response", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Security Standards", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
    { title: "Advanced Topics", image: "/images/cs.png", duration: "12 Jam", modules: "6 Modul", originalPrice: "Rp. 550,000", discountedPrice: "Rp. 299,000" },
  ],
};

type RoadmapKey = keyof typeof roadmapData;

const tabs = [
  { id: 'android', label: 'Android Developer' },
  { id: 'frontend', label: 'Front-End Developer' },
  { id: 'backend', label: 'Back-End Developer' },
  { id: 'cybersecurity', label: 'Cyber Security' },
];

export default function RoadMap() {
  const [activeTab, setActiveTab] = useState<RoadmapKey>('android');

  const courses = roadmapData[activeTab];

  return (
    <div className="w-full min-h-screen bg-blue-second flex flex-col justify-center items-center py-12">
      <div className="w-10/12 flex flex-col justify-center items-center pb-14">
        <div className="flex flex-col text-center items-center gap-3">
          <span className="bg-gradient-to-r from-gradient-1 to-gradient-2 text-transparent bg-clip-text text-lg font-medium w-fit">
            Rute Karir
          </span>
          <h1 className="text-white font-semibold text-2xl md:text-3xl">Mulai Langkah Menuju Karir Impian</h1>
        </div>

        <div className="p-2 rounded-lg bg-blue-button flex items-center mt-8">
          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RoadmapKey)}
                className={`rounded-md px-5 py-2 text-white font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#696EFF] to-[#F8ACFF]'
                    : 'bg-blue-second'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Select */}
          <div className="md:hidden w-full">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as RoadmapKey)}
              className="w-full bg-gradient-to-r from-[#696EFF] to-[#F8ACFF] rounded-md px-4 py-4 text-white font-medium"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id} className="bg-[#052742] text-white">
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div className="w-full mt-4 pl-7 md:px-0">
        <div className="w-full h-fit flex overflow-x-scroll pb-8 scrollbar-hide">
          <div className="w-fit md:ml-60 ml-12 gap-x-5">
            <div className="w-full h-full">
              {/* Progress Line */}
              <div className="progress-line w-full h-1 bg-white mt-3 mb-14 relative flex gap-x-4 ml-28">
                {courses.map((_, index) => (
                  <div key={index} className="pr-40 md:pr-16 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full border-2 border-gradient-1"></div>
                  </div>
                ))}
              </div>

              {/* Cards */}
              <div className="flex justify-between gap-x-5 -translate-x-12 md:-translate-x-32">
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl max-h-[25rem] h-[25rem] aspect-[4/5] flex flex-col p-4"
                  >
                    <div className="w-full aspect-video">
                      <Image src={course.image} alt={course.title} width={300} height={200} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="w-full flex flex-col items-center pt-5 pb-3 justify-between flex-1">
                      <div className="w-full flex items-center gap-x-4">
                        <span className="text-sm font-normal text-text-base flex gap-x-2 items-center justify-center">
                          <i className="fa-regular fa-clock text-gradient-1 font-normal opacity-100"></i>
                          <span className="opacity-60">{course.duration}</span>
                        </span>
                        <span className="text-sm font-normal text-text-base flex gap-x-2 items-center justify-center">
                          <i className="fa-solid fa-video text-gradient-1 font-normal opacity-100"></i>
                          <span className="opacity-60">{course.modules}</span>
                        </span>
                      </div>
                      <h1 className="text-xl text-text-base mt-2">{course.title}</h1>
                      <div className="w-full flex items-center gap-x-2 text-md mt-2">
                        <span className="line-through text-text-red opacity-80 font-semibold">{course.originalPrice}</span>
                        <span className="text-black opacity-80 font-bold">{course.discountedPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
