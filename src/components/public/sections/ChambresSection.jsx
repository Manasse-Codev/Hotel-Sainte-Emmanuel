import { useEffect, useRef, useState } from 'react';
import { rooms as initialRooms } from '../../../data/rooms';
import { api } from '../../../services/api';

export default function ChambresSection({ onOpenRoom, onQuickBook }) {
  const sectionRef = useRef(null);
  const [roomList, setRoomList] = useState(initialRooms);

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

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await api.rooms.getAll();
        if (Array.isArray(data) && data.length > 0) {
          setRoomList(data);
        }
      } catch (err) {
        console.warn('Utilisation des données locales de chambres en fallback:', err.message);
      }
    }
    fetchRooms();
  }, []);

  return (
    <section
      className="chapter-section flex flex-col justify-center py-24 px-6 md:px-12 max-w-7xl mx-auto bg-surface-container-low"
      id="chambres"
    >
      <div ref={sectionRef} className="reveal">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-label-sm tracking-widest text-on-surface-variant">02</span>
              <div className="w-12 h-[1px] bg-outline-variant" />
              <span className="text-label-sm tracking-widest uppercase text-secondary font-medium">
                Hébergement d'Exception
              </span>
            </div>
            <h2 className="font-bodoni text-headline-lg">CHAMBRES — Trouvez l'espace qui vous ressemble.</h2>
          </div>
          <p className="font-jakarta text-body-md text-on-surface-variant max-w-md mt-4 md:mt-0">
            Chaque chambre a été aménagée pour vous garantir un repos absolu : literie soignée,
            climatisation réglable, salle de bain privative et tranquillité assurée.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roomList.map((room) => (
            <div
              key={room.id}
              className="bg-surface border border-outline-variant/30 flex flex-col justify-between group transition-shadow hover:shadow-md"
            >
              <div>
                <div className="relative h-[280px] overflow-hidden bg-surface-container">
                  <img
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={room.image}
                  />
                  <div
                    className={`absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 text-label-sm uppercase tracking-wider font-medium ${
                      room.badge_type === 'available' || room.badgeType === 'available'
                        ? 'text-primary'
                        : 'text-secondary'
                    }`}
                  >
                    {room.badge}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-bodoni text-headline-sm">{room.name}</h3>
                    <span className="font-bodoni text-headline-sm text-secondary font-bold">
                      {room.price_display || room.price}{' '}
                      <span className="text-xs text-on-surface-variant font-normal font-jakarta">/ nuit</span>
                    </span>
                  </div>
                  <p className="font-jakarta text-body-sm text-on-surface-variant">{room.short_desc || room.shortDesc}</p>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button
                  className="w-1/2 py-2.5 border border-primary text-primary text-label-md tracking-wider uppercase hover:bg-surface-container transition-colors"
                  onClick={() => onOpenRoom(room)}
                  type="button"
                >
                  Voir la chambre
                </button>
                <a
                  className="w-1/2 py-2.5 bg-primary text-on-primary text-label-md tracking-wider uppercase text-center hover:bg-neutral-800 transition-colors flex items-center justify-center"
                  href="#reservation"
                  onClick={() => onQuickBook(room.id)}
                >
                  Réserver
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
