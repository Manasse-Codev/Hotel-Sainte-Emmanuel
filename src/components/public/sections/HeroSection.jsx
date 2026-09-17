import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('visible');
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="chapter-section flex flex-col justify-center pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto"
      id="accueil"
    >
      <div ref={sectionRef} className="reveal grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[640px]">
        {/* Texte gauche */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-label-sm tracking-widest text-on-surface-variant">01</span>
            <div className="w-12 h-[1px] bg-outline-variant" />
            <span className="text-label-sm tracking-widest uppercase text-secondary font-medium">
              Bienvenue à Soubré
            </span>
          </div>

          <h1 className="font-bodoni text-[40px] md:text-[56px] leading-[1.15] tracking-[0.05em] font-light text-on-surface">
            L'Élégance discrète en Côte d'Ivoire
          </h1>

          <p className="font-jakarta text-body-lg text-on-surface-variant max-w-lg font-light">
            Au cœur de la région de la Nawa, l'Hôtel Sainte Emmanuelle vous accueille dans une
            atmosphère soignée, alliant hospitalité chaleureuse ivoirienne, confort contemporain
            et quiétude absolue.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a
              className="inline-flex items-center gap-3 text-label-md tracking-wider uppercase border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all"
              href="#chambres"
            >
              Découvrir nos chambres
              <span className="material-symbols-outlined text-sm" style={{ fontSize: '16px' }}>arrow_downward</span>
            </a>
            <a
              className="bg-primary text-on-primary px-6 py-3 text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors"
              href="#reservation"
            >
              Réserver votre séjour
            </a>
          </div>
        </div>

        {/* Image droite */}
        <div className="lg:col-span-6 relative h-[480px] lg:h-[540px] overflow-hidden group shadow-sm bg-surface-container">
          <img
            alt="Façade de l'Hôtel Sainte Emmanuelle à Soubré"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNgu0QWrMhs1smgBH0M6oeoEyKdgkEQShYLJ6Jh27iEj05NvF8Pki6ANO8jT3S5eHpwUvLJahXQQaqkGsGs3E68qrwo2n63xI1NE-np8HUI7jyTMkyY1BlxEJMVgBOyIonorBYdwqeBftTyeSL7diE975uNWi5ZyvB3zg0ppXUQ6ZC8bFeFntPjR_jZowISHbah625FpkzwcXONjc3qZoJBcRGTZyEnjuGc9x5qLC450JZPAPp8YK6vWpDglcVkHNqzA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <span className="text-label-sm tracking-widest uppercase text-secondary-fixed block mb-1">
              Architecture & Accueil
            </span>
            <div className="font-bodoni text-headline-sm">Hôtel Sainte Emmanuelle — Soubré</div>
          </div>
        </div>
      </div>
    </section>
  );
}
