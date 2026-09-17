import { useEffect, useRef } from 'react';
import { offers } from '../../../data/offers';

export default function OffresSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="chapter-section flex flex-col justify-center py-24 px-6 md:px-12 bg-surface-container-low"
      id="offres"
    >
      <div ref={sectionRef} className="reveal max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-label-sm tracking-widest text-on-surface-variant">05</span>
            <div className="w-12 h-[1px] bg-outline-variant" />
            <span className="text-label-sm tracking-widest uppercase text-secondary font-medium">
              Formules & Forfaits
            </span>
          </div>
          <h2 className="font-bodoni text-headline-lg">OFFRES & PACKAGES Spéciaux.</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`p-8 flex flex-col gap-5 border relative ${
                offer.featured
                  ? 'bg-primary text-on-primary border-primary shadow-lg'
                  : 'bg-surface border-outline-variant/30 hover:border-primary transition-colors'
              }`}
            >
              {offer.badge && (
                <span className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 text-label-sm uppercase tracking-widest">
                  {offer.badge}
                </span>
              )}
              <span
                className={`text-label-md tracking-widest uppercase font-medium ${
                  offer.featured ? 'text-secondary-fixed' : 'text-secondary'
                }`}
              >
                {offer.category}
              </span>
              <h3
                className={`font-bodoni text-headline-sm ${
                  offer.featured ? 'text-on-primary' : 'text-primary'
                }`}
              >
                {offer.name}
              </h3>
              <p
                className={`font-jakarta text-body-sm flex-1 ${
                  offer.featured ? 'text-white/70' : 'text-on-surface-variant'
                }`}
              >
                {offer.description}
              </p>
              <a
                className={`border py-3 text-label-md tracking-widest uppercase text-center transition-colors ${
                  offer.featured
                    ? 'border-white text-white hover:bg-white/10'
                    : 'border-primary text-primary hover:bg-surface-container'
                }`}
                href="#reservation"
              >
                Demander un devis
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
