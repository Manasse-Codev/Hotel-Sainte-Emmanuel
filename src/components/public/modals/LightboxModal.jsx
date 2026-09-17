import { useEffect, useState, useCallback } from 'react';
import { galleryImages } from '../../../data/gallery';

export default function LightboxModal({ image, isOpen, onClose }) {
  const [current, setCurrent] = useState(image);

  useEffect(() => {
    setCurrent(image);
  }, [image]);

  const navigate = useCallback((dir) => {
    if (!current) return;
    const idx = galleryImages.findIndex((img) => img.id === current.id);
    const next = galleryImages[(idx + dir + galleryImages.length) % galleryImages.length];
    setCurrent(next);
  }, [current]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, navigate, onClose]);

  if (!isOpen || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Close */}
      <button
        aria-label="Fermer la vue agrandie"
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>close</span>
      </button>

      {/* Prev */}
      <button
        aria-label="Photo précédente"
        className="absolute left-6 p-3 text-white/70 hover:text-white transition-colors"
        onClick={() => navigate(-1)}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_back_ios</span>
      </button>

      {/* Image */}
      <div className="max-w-4xl w-full max-h-[80vh] relative">
        <img
          alt={current.alt}
          className="w-full h-full object-contain animate-fade-in"
          key={current.id}
          src={current.image}
          style={{ maxHeight: '80vh' }}
        />
        <div className="text-center mt-4">
          <span className="font-jakarta text-label-sm tracking-widest uppercase text-secondary">{current.subtitle}</span>
          <div className="font-bodoni text-white text-headline-sm mt-1">{current.title}</div>
        </div>
      </div>

      {/* Next */}
      <button
        aria-label="Photo suivante"
        className="absolute right-6 p-3 text-white/70 hover:text-white transition-colors"
        onClick={() => navigate(1)}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_forward_ios</span>
      </button>
    </div>
  );
}
