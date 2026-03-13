import Link from 'next/link';

export default function Footer() {
  return (
    <section className="footer-section">
      <div className="footer-container">
        <div className="footer-content">
          <p className="website-name">Luminus</p>
          <p className="footer-text">
            Tempat kursus koding terbaik untuk bantu kamu jadi ahli di dunia koding!
          </p>
        </div>
        <div className="footer-content">
          <p className="website-name">Navigasi</p>
          <div className="footer-links">
            <Link href="/">
              <p>Beranda</p>
            </Link>
            <Link href="#about-section">
              <p>Tentang</p>
            </Link>
            <Link href="#kursus-section">
              <p>Kursus</p>
            </Link>
            <Link href="#rutekarir-section">
              <p>Rute Karir</p>
            </Link>
            <Link href="#faq-section">
              <p>FAQ</p>
            </Link>
          </div>
        </div>
        <div className="footer-content">
          <p className="website-name">Halaman</p>
          <div className="footer-links">
            <Link href="/">
              <p>Beranda</p>
            </Link>
            <Link href="/kursus">
              <p>Kursus</p>
            </Link>
            <Link href="/forum">
              <p>Forum</p>
            </Link>
          </div>
        </div>
        <div className="footer-content">
          <p className="website-name">Kontak</p>
          <div className="footer-links">
            <a href="mailto:luminus.student@gmail.com">
              <p>luminus.student@gmail.com</p>
            </a>
            <p>+62 869 6969 6969</p>
            <p>Denpasar, Bali</p>
          </div>
        </div>
      </div>
      <p className="absolute bottom-5 left-0 w-full text-center opacity-60 text-white font-medium text-sm">
        Copyright © <span className="hover:font-bold hover:underline cursor-pointer">Luminus</span>
      </p>
    </section>
  );
}
