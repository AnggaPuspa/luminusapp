'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ChatHeaderProps {
  onReset: () => void;
}

export default function ChatHeader({ onReset }: ChatHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex justify-between py-5 px-6 border-b bg-[#052742] md:rounded-t-2xl items-center">
      <div className="flex justify-center w-fit items-center gap-x-3">
        <Image
          src="/images/ai.png"
          alt="Bot Avatar"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h1 className="text-xl text-white font-semibold">
          Lumin<span className="bg-gradient-to-r from-[#696eff] to-[#f8acff] text-transparent bg-clip-text">AI</span>
        </h1>
      </div>

      {/* Desktop buttons */}
      <div className="hidden md:flex justify-center gap-x-3">
        <button
          onClick={onReset}
          className="w-fit flex justify-center items-center gap-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <i className="fa-solid fa-rotate-left"></i>
          <span>Reset Chat</span>
        </button>
        <Link
          href="/"
          className="w-10 aspect-square bg-white text-[#101010] flex justify-center items-center rounded-lg hover:bg-transparent hover:border hover:border-white hover:text-white"
          title="close"
        >
          <i className="fa-solid fa-x"></i>
        </Link>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden relative">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 aspect-square bg-white text-[#101010] flex justify-center items-center rounded-lg hover:bg-transparent hover:border hover:border-white hover:text-white"
        >
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
        {mobileMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg py-2 z-50 shadow-lg">
            <button
              onClick={() => {
                onReset();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
            >
              <i className="fa-solid fa-rotate-left mr-2"></i>Reset Chat
            </button>
            <Link href="/" className="block px-4 py-2 text-[#101010] hover:bg-gray-100">
              <i className="fa-solid fa-x mr-2"></i>Close
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
