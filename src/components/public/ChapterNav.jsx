import { useState, useEffect } from 'react';

const chapters = [
  { num: 1, href: '#accueil', label: 'Accueil' },
  { num: 2, href: '#chambres', label: 'Chambres' },
  { num: 3, href: '#experience', label: 'Expérience' },
  { num: 4, href: '#galerie', label: 'Galerie' },
  { num: 5, href: '#offres', label: 'Offres' },
  { num: 6, href: '#infos-pratiques', label: 'Infos & FAQ' },
  { num: 7, href: '#contact', label: 'Contact & Réservation' },
];

export default function ChapterNav() {
  const [activeChapter, setActiveChapter] = useState(1);

  useEffect(() => {
    const sectionIds = ['accueil', 'chambres', 'experience', 'galerie', 'offres', 'infos-pratiques', 'contact'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(entry.target.id);
            if (idx !== -1) setActiveChapter(idx + 1);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const active = chapters.find((c) => c.num === activeChapter);

  return (
    <aside
      aria-label="Progression des sections"
      className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden 2xl:flex flex-col items-center gap-6 pointer-events-none"
    >
      <div className="text-label-sm tracking-widest text-on-surface-variant -rotate-90 mb-4 whitespace-nowrap">
        {String(activeChapter).padStart(2, '0')} / 07 {active?.label.toUpperCase()}
      </div>
      <div className="flex flex-col gap-3 pointer-events-auto">
        {chapters.map((ch) => (
          <a
            key={ch.num}
            className="chapter-dot group flex items-center gap-2 py-1"
            data-chapter={ch.num}
            href={ch.href}
            title={ch.label}
          >
            <span
              className={`rounded-full transition-all duration-300 ${
                activeChapter === ch.num
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-outline-variant hover:bg-primary/50'
              }`}
            />
          </a>
        ))}
      </div>
    </aside>
  );
}
