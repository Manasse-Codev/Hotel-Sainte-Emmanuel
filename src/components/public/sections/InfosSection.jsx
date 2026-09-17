import { useEffect, useRef, useState } from 'react';
import { faqs } from '../../../data/faq';

const practicalInfo = [
  { icon: 'login', label: 'Check-in', value: 'À partir de 14h00', note: 'Arrivée anticipée possible selon disponibilité' },
  { icon: 'logout', label: 'Check-out', value: 'Avant 12h00', note: 'Départ tardif possible (supplément)' },
  { icon: 'payments', label: 'Paiements', value: 'Wave · Orange Money · Espèces', note: 'FCFA uniquement' },
  { icon: 'local_parking', label: 'Parking', value: 'Gratuit & Sécurisé', note: 'Surveillé 24h/24' },
  { icon: 'wifi', label: 'Wi-Fi', value: 'Inclus & Gratuit', note: 'Toutes les chambres & espaces communs' },
  { icon: 'restaurant', label: 'Restaurant', value: 'Ouvert 06h - 22h', note: 'Petit-déjeuner · Déjeuner · Dîner' },
];

export default function InfosSection() {
  const sectionRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);

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
      id="infos-pratiques"
    >
      <div ref={sectionRef} className="reveal">
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-label-sm tracking-widest text-on-surface-variant">06</span>
            <div className="w-12 h-[1px] bg-outline-variant" />
            <span className="text-label-sm tracking-widest uppercase text-secondary font-medium">
              Votre Séjour en Détail
            </span>
          </div>
          <h2 className="font-bodoni text-headline-lg">Infos Pratiques & FAQ</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Infos pratiques */}
          <div>
            <h3 className="font-bodoni text-headline-sm mb-8 pb-4 border-b border-outline-variant/30">
              Informations Essentielles
            </h3>
            <div className="space-y-4">
              {practicalInfo.map((info) => (
                <div
                  key={info.label}
                  className="flex items-start gap-4 p-4 border border-outline-variant/20 hover:border-outline-variant transition-colors"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-surface-container">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                      {info.icon}
                    </span>
                  </div>
                  <div>
                    <span className="font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant block">
                      {info.label}
                    </span>
                    <span className="font-bodoni text-headline-sm block mt-0.5">{info.value}</span>
                    <span className="font-jakarta text-body-sm text-on-surface-variant">{info.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-bodoni text-headline-sm mb-8 pb-4 border-b border-outline-variant/30">
              Questions Fréquentes
            </h3>
            <div className="space-y-1">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-outline-variant/20">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    type="button"
                  >
                    <span className="font-jakarta text-body-sm font-medium pr-4">{faq.question}</span>
                    <span
                      className="material-symbols-outlined text-secondary flex-shrink-0 transition-transform"
                      style={{
                        fontSize: '18px',
                        transform: openFaq === faq.id ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-5 pb-5 pt-1 bg-surface-container-low">
                      <p className="font-jakarta text-body-sm text-on-surface-variant">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
