'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ScrollButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link href="/chat" className={`scroll-up-btn ${show ? 'show' : ''}`}>
      <Image src="/images/bot.png" alt="chat bot" width={40} height={35} className="w-10 h-9" />
    </Link>
  );
}
