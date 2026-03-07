import Image from 'next/image';

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        {/* Left images */}
        <Image src="/images/cta-left-people.png" alt="profile" width={260} height={300} className="cta-left-people-images" />
        <Image src="/images/dott.png" alt="dott" width={150} height={150} className="cta-left-dott" />

        <div className="cta-text-section">
          <div className="cta-title">
            <h1>Jadilah Ahli di Bidangmu! 🚀</h1>
          </div>
          <div className="cta-description">
            <p>
              Akses kursus premium dengan mentor berpengalaman, kapan saja dan di mana saja. Jangan lewatkan kesempatan ini!
            </p>
          </div>
          <div className="cta-button">
            <button>Dapatkan Sekarang</button>
          </div>
        </div>

        {/* Right images */}
        <Image src="/images/cta-right-people.png" alt="profile" width={240} height={300} className="cta-right-people-images" />
        <Image src="/images/dott.png" alt="dott" width={150} height={150} className="cta-right-dott" />
      </div>
    </section>
  );
}
