import { useEffect, useState } from 'react';
import { api } from '../../../services/api';

const statusStyles = {
  confirmed: 'bg-surface-container text-primary font-semibold',
  completed: 'bg-surface-variant text-on-surface-variant',
  pending: 'bg-secondary-container text-on-secondary-container',
  cancelled: 'bg-error-container text-on-error-container',
};

const statusLabels = {
  confirmed: 'Confirmé',
  completed: 'Terminé',
  pending: 'En attente',
  cancelled: 'Annulé',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReservations = async () => {
    try {
      const data = await api.admin.getReservations();
      setReservations(data || []);
    } catch (err) {
      console.warn('Erreur réservations admin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.admin.updateReservationStatus(id, newStatus);
      await fetchReservations();
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            Exploitation
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Réservations & Arrivées</h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
            Registre complet des séjours en direct depuis la base SQLite.
          </p>
        </div>
        <span className="font-jakarta text-label-md text-on-surface-variant font-medium">
          {reservations.length} réservation(s) au total
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement du registre...</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-jakarta text-body-sm bg-surface-container-lowest border border-outline-variant/30">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-jakarta text-label-sm uppercase">
                {['Réf', 'Client', 'Chambre', 'Arrivée', 'Départ', 'Nuits', 'Montant', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-on-surface-variant">
                    Aucune réservation enregistrée.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => {
                  const nights = Math.max(
                    1,
                    Math.round((new Date(res.check_out) - new Date(res.check_in)) / (1000 * 60 * 60 * 24))
                  );
                  return (
                    <tr key={res.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{res.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-on-surface">{res.guest_name}</div>
                        <div className="text-on-surface-variant text-xs">{res.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{res.room?.name || res.room_id}</div>
                        <div className="text-on-surface-variant text-xs">{res.guests} personne(s)</div>
                      </td>
                      <td className="py-3 px-4 text-xs">{res.check_in}</td>
                      <td className="py-3 px-4 text-xs">{res.check_out}</td>
                      <td className="py-3 px-4 font-semibold">{nights}n</td>
                      <td className="py-3 px-4 font-bodoni text-headline-sm text-secondary font-bold">
                        {res.total_amount?.toLocaleString()} FCFA
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-jakarta text-label-xs px-2.5 py-1 uppercase tracking-wider ${statusStyles[res.status] || 'bg-surface-container'}`}>
                          {statusLabels[res.status] || res.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="border border-outline-variant/40 bg-surface px-2 py-1 text-label-xs uppercase font-medium focus:border-primary focus:outline-none"
                          disabled={updatingId === res.id}
                          onChange={(e) => handleStatusChange(res.id, e.target.value)}
                          value={res.status}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="completed">Terminé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
