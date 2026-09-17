import { useEffect, useState } from 'react';
import { api } from "../../../services/api";
import { getRoomImage } from '../../../data/rooms';

const statusConfig = {
  occupied: { label: 'Occupée', classes: 'bg-primary text-on-primary' },
  available: { label: 'Disponible', classes: 'bg-surface-container text-primary font-semibold' },
  maintenance: { label: 'Maintenance', classes: 'bg-error-container text-on-error-container' },
};

export default function ChambresPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRooms = async () => {
    try {
      const data = await api.admin.getRooms();
      setRooms(data || []);
    } catch (err) {
      console.warn('Erreur chambres admin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.admin.updateRoomStatus(id, newStatus);
      await fetchRooms();
    } catch (err) {
      alert(err.message || 'Impossible de modifier le statut de la chambre.');
    } finally {
      setUpdatingId(null);
    }
  };

  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            État du Parc
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Chambres & Entretien</h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
            Disponibilité et maintenance en temps réel pour l'équipe d'étage.
          </p>
        </div>
        <span className="font-jakarta text-label-md text-on-surface-variant font-medium">
          {rooms.length} suite(s) configurée(s)
        </span>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'occupied', label: 'Occupées', count: occupiedCount },
          { key: 'available', label: 'Disponibles', count: availableCount },
          { key: 'maintenance', label: 'En Maintenance', count: maintenanceCount },
        ].map((s) => (
          <div key={s.key} className="bg-surface-container-lowest border border-outline-variant/30 p-4 text-center">
            <div className="font-bodoni text-headline-md">{s.count}</div>
            <div className="font-jakarta text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid des chambres */}
      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement du parc...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const cfg = statusConfig[room.status] || statusConfig.available;
            return (
              <div
                key={room.id}
                className="bg-surface-container-lowest border border-outline-variant/30 p-5 space-y-4 shadow-xs"
              >
                <div className="relative h-44 overflow-hidden bg-surface-container">
                  <img
                    alt={room.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    src={getRoomImage(room)}
                    onError={(e) => { e.currentTarget.src = '/images/hero.jpg'; }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`font-jakarta text-label-xs px-2.5 py-1 uppercase tracking-wider font-semibold ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bodoni text-headline-sm">{room.name}</h3>
                    <span className="font-bodoni text-title-md text-secondary font-bold">
                      {room.price_display}
                    </span>
                  </div>
                  <p className="font-jakarta text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                    {room.short_desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
                    Modifier statut :
                  </span>
                  <select
                    className="border border-outline-variant/40 bg-surface px-2.5 py-1 text-label-xs uppercase font-medium focus:border-primary focus:outline-none"
                    disabled={updatingId === room.id}
                    onChange={(e) => handleStatusChange(room.id, e.target.value)}
                    value={room.status}
                  >
                    <option value="available">Disponible</option>
                    <option value="occupied">Occupée</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
