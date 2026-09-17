import { useEffect } from 'react';

export default function RoomDetailModal({ room, isOpen, onClose, onReserve }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface w-full max-w-3xl relative animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close */}
        <button
          className="absolute top-4 right-4 z-10 p-2 hover:bg-surface-container transition-colors text-on-surface-variant bg-surface/80"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>

        {/* Image */}
        <div className="h-[320px] overflow-hidden bg-surface-container relative">
          <img
            alt={room.name}
            className="w-full h-full object-cover"
            src={room.image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8 text-white">
            <span className="font-jakarta text-label-sm tracking-widest uppercase text-secondary-fixed block mb-1">
              {room.capacity}
            </span>
            <h2 className="font-bodoni text-headline-lg">{room.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
            <div>
              <div className="font-bodoni text-headline-md text-secondary">{room.price}</div>
              <div className="font-jakarta text-body-sm text-on-surface-variant">par nuit, toutes taxes comprises</div>
            </div>
            <div
              className={`px-4 py-2 text-label-md uppercase tracking-wider font-medium ${
                room.badgeType === 'available'
                  ? 'bg-surface-container text-primary'
                  : 'bg-secondary-container text-on-secondary-container'
              }`}
            >
              {room.badge}
            </div>
          </div>

          <p className="font-jakarta text-body-lg text-on-surface-variant">{room.fullDesc}</p>

          <div>
            <h3 className="font-bodoni text-headline-sm mb-4">Équipements & Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>
                    check_circle
                  </span>
                  <span className="font-jakarta text-body-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              className="flex-1 py-3 border border-primary text-primary text-label-md tracking-widest uppercase hover:bg-surface-container transition-colors"
              onClick={onClose}
              type="button"
            >
              Fermer
            </button>
            <a
              className="flex-1 py-3 bg-primary text-on-primary text-label-md tracking-widest uppercase text-center hover:bg-neutral-800 transition-colors"
              href="#reservation"
              onClick={() => {
                onClose();
                if (onReserve) onReserve(room.id);
              }}
            >
              Réserver cette chambre
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
