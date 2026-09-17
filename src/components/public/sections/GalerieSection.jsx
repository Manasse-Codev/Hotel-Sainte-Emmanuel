import { useEffect, useRef, useState } from 'react';
import { galleryImages, galleryFilters } from '../../../data/gallery';

export default function GalerieSection({ onOpenLightbox }) {
  const sectionRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeFilter);

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
      className="chapter-section flex flex-col justify-center py-24 px-6 md:px-12 max-w-7xl mx-auto"
      id="galerie"
    >
      <div ref={sectionRef} className="reveal">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-label-sm tracking-widest text-on-surface-variant">04</span>
              <div className="w-12 h-[1px] bg-outline-variant" />
              <span className="text-label-sm tracking-widest uppercase text-secondary font-medium">
                Images & Atmosphères
              </span>
            </div>
            <h2 className="font-bodoni text-headline-lg">Galerie Photographique</h2>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-10">
          {galleryFilters.map((f) => (
            <button
              key={f.key}
              className={`px-5 py-2 text-label-md tracking-widest uppercase border transition-all ${
                activeFilter === f.key
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
              onClick={() => setActiveFilter(f.key)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grille */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filtered.map((img, idx) => (
            <button
              key={img.id}
              className={`group relative overflow-hidden bg-surface-container ${
                idx === 0 ? 'col-span-2 md:col-span-2 row-span-2 h-[400px] md:h-[480px]' : 'h-[200px] md:h-[235px]'
              }`}
              onClick={() => onOpenLightbox(img)}
              type="button"
            >
              <img
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                src={img.image}
                onError={(e) => { e.currentTarget.src = '/images/hero.jpg'; }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="text-label-sm tracking-widest uppercase text-white/70">{img.subtitle}</span>
                <span className="font-bodoni text-headline-sm text-white">{img.title}</span>
                <span className="material-symbols-outlined text-white/80 mt-2" style={{ fontSize: '20px' }}>
                  zoom_in
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
