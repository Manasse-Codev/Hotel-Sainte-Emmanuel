import { useEffect, useRef } from 'react';

const pillars = [
  {
    icon: 'volunteer_activism',
    label: 'Accueil',
    title: 'Accueil Chaleureux',
    description: 'Dès votre arrivée, notre équipe met tout en œuvre pour que vous vous sentiez chez vous.',
  },
  {
    icon: 'king_bed',
    label: 'Confort',
    title: 'Confort Absolu',
    description: 'Literie premium, espaces soignés, climatisation — chaque détail compte pour votre bien-être.',
  },
  {
    icon: 'restaurant',
    label: 'Saveurs',
    title: 'Saveurs du Terroir',
    description: 'Un restaurant proposant les spécialités ivoiriennes et une cuisine internationale raffinée.',
  },
  {
    icon: 'explore',
    label: 'Découverte',
    title: 'Découverte Locale',
    description: 'Soubré et la région de la Nawa regorgent de paysages et cultures à explorer.',
  },
];

export default function ExperienceSection() {
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
      className="chapter-section flex flex-col justify-center py-24 px-6 md:px-12"
      id="experience"
      style={{ background: 'linear-gradient(135deg, #1c1b1b 0%, #2a2929 100%)' }}
    >
      <div ref={sectionRef} className="reveal max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-label-sm tracking-widest text-white/50">03</span>
            <div className="w-12 h-[1px] bg-white/20" />
            <span className="text-label-sm tracking-widest uppercase text-secondary-fixed font-medium">
              Vivre l'Expérience
            </span>
          </div>
          <h2 className="font-bodoni text-headline-lg text-white max-w-2xl">
            Bien plus qu'une chambre. Un séjour mémorable.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-white/10">
          {pillars.map((p) => (
            <div
              key={p.label}
              className="bg-[#1c1b1b] p-8 space-y-4 group hover:bg-[#242323] transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 border border-white/20 group-hover:border-secondary transition-colors">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>
                  {p.icon}
                </span>
              </div>
              <span className="font-jakarta text-label-md tracking-widest uppercase text-secondary block">
                {p.label}
              </span>
              <h3 className="font-bodoni text-headline-sm text-white">{p.title}</h3>
              <p className="font-jakarta text-body-sm text-white/60 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
