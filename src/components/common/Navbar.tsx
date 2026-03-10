'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStudentProfile } from '@/hooks/use-dashboard';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Real auth via SWR — no hydration mismatch because initial state is null (same as SSR)
  const { profile, isLoading: authLoading } = useStudentProfile();
  const isLoggedIn = !!profile;
  const firstName = profile?.name?.split(' ')[0] || 'User';
  const avatarUrl = profile?.avatarUrl || null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  // Skeleton for auth area (prevents layout shift & hydration flash)
  const AuthSkeleton = () => (
    <div className="flex items-center gap-2 animate-pulse">
      <div className={`w-9 h-9 rounded-full ${scrolled ? 'bg-gray-200' : 'bg-white/10'}`} />
      <div className={`w-16 h-4 rounded ${scrolled ? 'bg-gray-200' : 'bg-white/10'}`} />
    </div>
  );

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

            {/* Auth Buttons (Desktop) */}
            <div className="hidden md:flex justify-between gap-3 items-center h-full">
              {authLoading ? (
                <AuthSkeleton />
              ) : !isLoggedIn ? (
                <Link
                  href="/login"
                  className={`flex items-center justify-center px-8 py-2 bg-gradient-to-r from-gradient-1 to-gradient-2 text-white font-semibold rounded-md text-lg ${scrolled ? 'hover-button' : 'header-hover-button'
                    }`}
                >
                  Masuk
                </Link>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-200
                      ${scrolled
                        ? 'hover:bg-gray-100 text-gray-800'
                        : 'hover:bg-white/10 text-white'
                      }`}
                  >
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2 shadow-sm
                      ${scrolled ? 'border-gray-200 bg-gray-100' : 'border-white/20 bg-white/10'}`}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-4 h-4 ${scrolled ? 'text-gray-400' : 'text-white/60'}`} />
                      )}
                    </div>

                    <span className="font-semibold text-sm hidden lg:inline">Halo, {firstName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{profile?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium w-full text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
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
          {authLoading ? (
            <div className="animate-pulse flex items-center gap-3 mb-6 w-full">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="w-24 h-4 rounded bg-gray-200" />
            </div>
          ) : !isLoggedIn ? (
            <Link
              href="/login"
              className="flex items-center justify-center mb-4 px-8 py-2 bg-gradient-to-r from-[#696EFF] to-[#F8ACFF] text-white font-semibold rounded-md text-lg header-hover-button"
            >
              Masuk
            </Link>
          ) : (
            <div className="relative flex flex-col w-full">
              <div className="flex gap-3 sm:flex-row flex-col sm:items-center items-end w-full justify-between mb-6">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 text-black border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <span className="font-semibold">Halo, {firstName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  Keluar
                </button>
              </div>
              <div className="text-lg font-semibold flex items-center w-full justify-between text-black mb-4">
                <Link href="/dashboard" className="underline" onClick={() => setMenuOpen(false)}>Dashboard</Link>
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
