import { useEffect, useState } from 'react';
import { api } from '../../../services/api';

const statusStyles = {
  confirmed: 'bg-surface-container text-primary font-semibold',
  completed: 'bg-surface-variant text-on-surface-variant',
  pending: 'bg-secondary-container text-on-secondary-container font-semibold',
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

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');

  // Selected reservation for detail modal
  const [selectedRes, setSelectedRes] = useState(null);

  const fetchReservations = async () => {
    try {
      const data = await api.admin.getReservations();
      setReservations(data || []);
      // If modal is open, update selectedRes data
      if (selectedRes) {
        const updated = (data || []).find((r) => r.id === selectedRes.id);
        if (updated) setSelectedRes(updated);
      }
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

  // Filtered list
  const filteredReservations = reservations.filter((res) => {
    const matchSearch =
      searchTerm === '' ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || res.status === statusFilter;
    const matchRoom = roomFilter === 'all' || res.room_id === roomFilter;

    return matchSearch && matchStatus && matchRoom;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-outline-variant/30 pb-4 gap-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            Exploitation
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Réservations & Arrivées</h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
            Registre complet des séjours synchronisé en direct avec la base SQLite.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-jakarta text-label-md text-on-surface-variant font-medium">
            {filteredReservations.length} / {reservations.length} réservation(s)
          </span>
          <button
            onClick={fetchReservations}
            type="button"
            className="p-2 border border-outline-variant/40 bg-surface hover:bg-surface-container transition-colors text-primary"
            title="Rafraîchir"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs">
        <div>
          <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
            Recherche par mot-clé
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Réf, nom du client, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-outline-variant/40 bg-surface text-body-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
            Filtrer par statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-outline-variant/40 bg-surface text-body-sm focus:border-primary focus:outline-none"
          >
            <option value="all">Tous les statuts ({reservations.length})</option>
            <option value="pending">En attente ({reservations.filter((r) => r.status === 'pending').length})</option>
            <option value="confirmed">Confirmé ({reservations.filter((r) => r.status === 'confirmed').length})</option>
            <option value="completed">Terminé ({reservations.filter((r) => r.status === 'completed').length})</option>
            <option value="cancelled">Annulé ({reservations.filter((r) => r.status === 'cancelled').length})</option>
          </select>
        </div>

        <div>
          <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
            Filtrer par chambre
          </label>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-outline-variant/40 bg-surface text-body-sm focus:border-primary focus:outline-none"
          >
            <option value="all">Toutes les chambres</option>
            <option value="standard">Chambre Standard</option>
            <option value="superieure">Chambre Supérieure</option>
            <option value="deluxe">Suite Deluxe</option>
          </select>
        </div>
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
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-jakarta text-label-sm uppercase bg-surface-container-low">
                {['Réf', 'Client', 'Chambre', 'Arrivée', 'Départ', 'Nuits', 'Montant', 'Statut', 'Actions Rapides', 'Détails'].map((h) => (
                  <th key={h} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-on-surface-variant">
                    Aucune réservation ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const nights = Math.max(
                    1,
                    Math.round((new Date(res.check_out) - new Date(res.check_in)) / (1000 * 60 * 60 * 24))
                  );
                  return (
                    <tr
                      key={res.id}
                      className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer"
                      onClick={() => setSelectedRes(res)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-primary">{res.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-on-surface">{res.guest_name}</div>
                        <div className="text-on-surface-variant text-xs">{res.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{res.room?.name || res.room_id}</div>
                        <div className="text-on-surface-variant text-xs">{res.guests} personne(s)</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">{res.check_in}</td>
                      <td className="py-3 px-4 text-xs font-mono">{res.check_out}</td>
                      <td className="py-3 px-4 font-semibold">{nights}n</td>
                      <td className="py-3 px-4 font-bodoni text-headline-sm text-secondary font-bold whitespace-nowrap">
                        {res.total_amount?.toLocaleString()} FCFA
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-jakarta text-label-xs px-2.5 py-1 uppercase tracking-wider inline-block ${statusStyles[res.status] || 'bg-surface-container'}`}>
                          {statusLabels[res.status] || res.status}
                        </span>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {res.status === 'pending' && (
                            <button
                              disabled={updatingId === res.id}
                              onClick={() => handleStatusChange(res.id, 'confirmed')}
                              className="px-2 py-1 bg-primary text-on-primary text-label-xs uppercase tracking-wider hover:opacity-90 font-medium"
                              title="Confirmer la réservation"
                            >
                              Confirmer
                            </button>
                          )}
                          {res.status === 'confirmed' && (
                            <button
                              disabled={updatingId === res.id}
                              onClick={() => handleStatusChange(res.id, 'completed')}
                              className="px-2 py-1 bg-surface-variant text-on-surface-variant text-label-xs uppercase tracking-wider hover:bg-surface-container font-medium"
                              title="Marquer comme terminé"
                            >
                              Terminer
                            </button>
                          )}
                          {res.status !== 'cancelled' && (
                            <button
                              disabled={updatingId === res.id}
                              onClick={() => handleStatusChange(res.id, 'cancelled')}
                              className="px-2 py-1 border border-error/50 text-error text-label-xs uppercase tracking-wider hover:bg-error/10 font-medium"
                              title="Annuler la réservation"
                            >
                              Annuler
                            </button>
                          )}
                          {res.status === 'cancelled' && (
                            <button
                              disabled={updatingId === res.id}
                              onClick={() => handleStatusChange(res.id, 'confirmed')}
                              className="px-2 py-1 border border-outline-variant text-primary text-label-xs uppercase tracking-wider hover:bg-surface-container font-medium"
                              title="Rétablir en confirmée"
                            >
                              Rétablir
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRes(res)}
                          className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                          title="Voir la fiche détaillée"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Fiche Détaillée Réservation */}
      {selectedRes && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRes(null);
          }}
        >
          <div className="bg-surface border border-outline-variant/40 shadow-2xl max-w-lg w-full p-6 relative animate-fade-in font-jakarta">
            <div className="h-[2px] bg-secondary absolute top-0 left-0 right-0" />
            
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
              <div>
                <span className="font-mono text-label-xs uppercase tracking-widest text-secondary font-bold block">
                  Détail Réservation #{selectedRes.id}
                </span>
                <h3 className="font-bodoni text-headline-md text-primary mt-0.5">
                  {selectedRes.guest_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="p-1.5 hover:bg-surface-container text-on-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="space-y-4 text-body-sm">
              <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest p-3 border border-outline-variant/30">
                <div>
                  <span className="text-label-xs uppercase text-on-surface-variant block">Téléphone</span>
                  <span className="font-semibold">{selectedRes.phone}</span>
                </div>
                <div>
                  <span className="text-label-xs uppercase text-on-surface-variant block">Statut Actuel</span>
                  <span className={`font-jakarta text-label-xs px-2 py-0.5 uppercase tracking-wider inline-block mt-0.5 ${statusStyles[selectedRes.status] || 'bg-surface-container'}`}>
                    {statusLabels[selectedRes.status] || selectedRes.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest p-3 border border-outline-variant/30">
                <div>
                  <span className="text-label-xs uppercase text-on-surface-variant block">Chambre</span>
                  <span className="font-semibold">{selectedRes.room?.name || selectedRes.room_id}</span>
                </div>
                <div>
                  <span className="text-label-xs uppercase text-on-surface-variant block">Personnes</span>
                  <span className="font-semibold">{selectedRes.guests} voyageur(s)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-3 border border-outline-variant/30 text-center">
                <div>
                  <span className="text-label-xs uppercase text-on-surface-variant block">Arrivée</span>
                  <span className="font-mono font-semibold text-xs">{selectedRes.check_in}</span>
                </div>
                <div>
                  <span className="text-label-xs uppercase text-on-surface-variant block">Départ</span>
                  <span className="font-mono font-semibold text-xs">{selectedRes.check_out}</span>
                </div>
                <div>
                  <span className="text-label-xs uppercase text-on-surface-variant block">Montant Total</span>
                  <span className="font-bodoni font-bold text-secondary text-sm">
                    {selectedRes.total_amount?.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {selectedRes.special_requests && (
                <div className="bg-surface-container-lowest p-3 border border-outline-variant/30">
                  <span className="text-label-xs uppercase text-on-surface-variant block mb-1">
                    Demandes particulières du client :
                  </span>
                  <p className="text-xs italic text-on-surface-variant">"{selectedRes.special_requests}"</p>
                </div>
              )}

              {/* Actions directes */}
              <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap gap-2 justify-end">
                {selectedRes.status !== 'confirmed' && (
                  <button
                    disabled={updatingId === selectedRes.id}
                    onClick={() => handleStatusChange(selectedRes.id, 'confirmed')}
                    className="px-3 py-1.5 bg-primary text-on-primary text-label-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
                  >
                    Confirmer la réservation
                  </button>
                )}
                {selectedRes.status !== 'completed' && selectedRes.status !== 'cancelled' && (
                  <button
                    disabled={updatingId === selectedRes.id}
                    onClick={() => handleStatusChange(selectedRes.id, 'completed')}
                    className="px-3 py-1.5 bg-surface-variant text-on-surface-variant text-label-xs uppercase tracking-wider font-semibold hover:bg-surface-container transition-colors"
                  >
                    Marquer séjour terminé
                  </button>
                )}
                {selectedRes.status !== 'cancelled' && (
                  <button
                    disabled={updatingId === selectedRes.id}
                    onClick={() => handleStatusChange(selectedRes.id, 'cancelled')}
                    className="px-3 py-1.5 border border-error/50 text-error text-label-xs uppercase tracking-wider font-semibold hover:bg-error/10 transition-colors"
                  >
                    Annuler la réservation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
