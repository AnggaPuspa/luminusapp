'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Static user untuk demo (ganti dengan auth state nanti)
  const isLoggedIn = false;
  const user = { name: 'User', role: 'siswa' };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="w-full h-fit flex justify-center items-center fixed z-50 transition-all duration-500 ease-in-out">
        <div
          className={`w-full flex items-center justify-center transition-all duration-200 ease-in-out h-fit py-6 ${scrolled ? 'bg-white shadow-[0px_8px_17px_0px_rgba(0,_0,_0,_0.1)]' : 'bg-[#032038]'
            }`}
        >
          <div className="w-[80%] h-full flex justify-between items-center transition-all duration-200 ease-in-out">
            {/* Logo */}
            <div className="logo flex justify-center items-center">
              <Link href="/" className={`font-semibold text-2xl ${scrolled ? 'text-black' : 'text-white'}`}>
                Lu<span className={scrolled ? 'text-black' : 'bg-gradient-to-r from-gradient-1 to-gradient-2 text-transparent bg-clip-text'}>minus</span>
              </Link>
            </div>

            {/* Navigation */}
            <div className="nav hidden justify-center items-center md:flex">
              <ul className={`flex justify-between items-center gap-2 ${scrolled ? 'text-gray-500' : 'text-gray-400'}`}>
                <li className={`mx-2 font-medium ${pathname === '/' ? (scrolled ? 'text-black' : 'text-white') : 'nav-links'}`}>
                  <Link href="/">Beranda</Link>
                </li>
                <li className={`mx-2 font-medium ${pathname === '/kursus' ? (scrolled ? 'text-black' : 'text-white') : 'nav-links'}`}>
                  <Link href="/kursus">Kursus</Link>
                </li>
                <li className={`mx-2 font-medium ${pathname === '/pricing' ? (scrolled ? 'text-black' : 'text-white') : 'nav-links'}`}>
                  <Link href="/pricing">Langganan</Link>
                </li>
                <li className={`mx-2 font-medium ${pathname === '/forum' ? (scrolled ? 'text-black' : 'text-white') : 'nav-links'}`}>
                  <Link href="/forum">Forum</Link>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="hidden md:flex justify-between gap-3 items-center h-full">
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className={`flex items-center justify-center px-8 py-2 bg-gradient-to-r from-gradient-1 to-gradient-2 text-white font-semibold rounded-md text-lg ${scrolled ? 'hover-button' : 'header-hover-button'
                    }`}
                >
                  Masuk
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-x-1 justify-center ${scrolled ? 'text-black' : 'text-white'}`}
                  >
                    Halo, {user.name} <span className="text-xs"><i className={`fa-solid fa-chevron-${dropdownOpen ? 'up' : 'down'}`}></i></span>
                  </button>
                  {dropdownOpen && (
                    <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                      <li className="px-4 py-2 hover:bg-gray-200 hover:rounded-lg">
                        <Link href="/dashboard">Dashboard</Link>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-200">
                        <button className="w-full text-left">Logout</button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden ${scrolled || menuOpen ? 'text-black' : 'text-white'}`}
            >
              <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed bg-white w-full h-screen z-40 ${menuOpen ? '' : 'hidden'}`}>
        <div className="flex w-full px-12 flex-col mt-24 items-center h-full">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="flex items-center justify-center mb-4 px-8 py-2 bg-gradient-to-r from-[#696EFF] to-[#F8ACFF] text-white font-semibold rounded-md text-lg header-hover-button"
            >
              Masuk
            </Link>
          ) : (
            <div className="relative flex flex-col w-full">
              <div className="flex gap-3 sm:flex-row flex-col sm:items-center items-end w-full justify-between mb-6">
                <div className="text-black border border-[#ddd] rounded-lg px-4 py-2">
                  Halo, {user.name}
                </div>
                <div className="px-4 py-2 text-white bg-red-500 rounded-lg">
                  <button className="w-full text-left">Logout</button>
                </div>
              </div>
              <div className="text-lg font-semibold flex items-center w-full justify-between text-black mb-4">
                <Link href="/dashboard" className="underline">Dashboard</Link>
                <i className="fa-solid fa-link w-6 text-center aspect-square text-xs text-gray-400"></i>
              </div>
            </div>
          )}

          <ul className="flex flex-col w-full items-center gap-6">
            <li className={`text-lg font-semibold flex items-center w-full justify-between ${pathname === '/' ? 'text-[#696EFF]' : 'text-black'}`}>
              <span><Link href="/">Beranda</Link></span>
              <i className="fa-solid fa-info w-6 text-center text-xs text-gray-400 aspect-square"></i>
            </li>
            <li className={`text-lg font-semibold flex items-center w-full justify-between ${pathname === '/kursus' ? 'text-[#696EFF]' : 'text-black'}`}>
              <span><Link href="/kursus">Kursus</Link></span>
              <i className="fa-solid fa-info w-6 text-center text-xs text-gray-400 aspect-square"></i>
            </li>
            <li className={`text-lg font-semibold flex items-center w-full justify-between ${pathname === '/pricing' ? 'text-[#696EFF]' : 'text-black'}`}>
              <span><Link href="/pricing">Langganan</Link></span>
              <i className="fa-solid fa-info w-6 text-center text-xs text-gray-400 aspect-square"></i>
            </li>
            <li className={`text-lg font-semibold flex items-center w-full justify-between ${pathname === '/forum' ? 'text-[#696EFF]' : 'text-black'}`}>
              <span><Link href="/forum">Forum</Link></span>
              <i className="fa-solid fa-link w-6 text-center aspect-square text-xs text-gray-400"></i>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
