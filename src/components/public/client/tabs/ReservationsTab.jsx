import { useEffect, useState } from 'react';
import { api } from '../../../../services/api';

const statusStyles = {
  confirmed: 'bg-surface-container text-primary font-medium',
  completed: 'bg-surface-variant text-on-surface-variant',
  cancelled: 'bg-error-container text-on-error-container',
  pending: 'bg-secondary-container text-on-secondary-container',
};

const statusLabels = {
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  pending: 'En attente',
};

export default function ReservationsTab({ onCloseClientSpace }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReservations = async () => {
    try {
      const data = await api.reservations.getMy();
      setReservations(data || []);
    } catch (err) {
      console.warn('Erreur chargement réservations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm(`Êtes-vous certain de vouloir annuler la réservation ${id} ?`)) {
      return;
    }
    setCancellingId(id);
    try {
      await api.reservations.cancel(id);
      await fetchReservations();
    } catch (err) {
      alert(err.message || 'Impossible d\'annuler la réservation.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <h2 className="font-bodoni text-headline-sm">Mes Réservations</h2>
        <span className="font-jakarta text-label-md text-on-surface-variant">
          {reservations.length} séjour(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement de vos séjours...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-outline-variant/40 p-8">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: '40px' }}>
            hotel
          </span>
          <p className="font-bodoni text-headline-sm mt-4 text-on-surface-variant">
            Aucune réservation enregistrée
          </p>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-1 mb-4">
            Réservez directement votre chambre pour profiter du confort de l'Hôtel Sainte Emmanuelle.
          </p>
          <a
            className="inline-block bg-primary text-on-primary px-5 py-2.5 text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            href="#reservation"
            onClick={onCloseClientSpace}
          >
            Réserver maintenant
          </a>
        </div>
      ) : (
        reservations.map((res) => {
          const nights = Math.max(
            1,
            Math.round((new Date(res.check_out) - new Date(res.check_in)) / (1000 * 60 * 60 * 24))
          );
          return (
            <div
              key={res.id}
              className="border border-outline-variant/30 p-5 bg-surface hover:border-outline-variant transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <div className="font-bodoni text-headline-sm">{res.room?.name || res.room_id}</div>
                  <div className="font-jakarta text-body-sm text-on-surface-variant mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-xs text-primary font-bold">Réf : {res.id}</span>
                    <span>·</span>
                    <span>{res.guests} personne{res.guests > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 font-jakarta text-label-md tracking-wider uppercase ${
                      statusStyles[res.status] || 'bg-surface-container'
                    }`}
                  >
                    {statusLabels[res.status] || res.status}
                  </span>

                  {res.status === 'confirmed' && (
                    <button
                      className="text-error hover:bg-error-container/20 px-2 py-1 text-label-xs uppercase font-semibold transition-colors disabled:opacity-50"
                      disabled={cancellingId === res.id}
                      onClick={() => handleCancel(res.id)}
                      title="Annuler cette réservation"
                      type="button"
                    >
                      {cancellingId === res.id ? 'Annulation...' : 'Annuler'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-surface-container-low p-4 border border-outline-variant/20">
                {[
                  { label: 'Arrivée', value: res.check_in },
                  { label: 'Départ', value: res.check_out },
                  { label: 'Durée', value: `${nights} nuit${nights > 1 ? 's' : ''}` },
                  { label: 'Montant', value: `${res.total_amount?.toLocaleString()} FCFA` },
                ].map((item) => (
                  <div key={item.label}>
                    <span className="font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant block mb-1">
                      {item.label}
                    </span>
                    <span className="font-bodoni text-headline-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              {res.special_requests && (
                <div className="mt-3 pt-3 border-t border-outline-variant/20 font-jakarta text-body-sm text-on-surface-variant">
                  <span className="font-medium text-on-surface">Demande particulière :</span> {res.special_requests}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
