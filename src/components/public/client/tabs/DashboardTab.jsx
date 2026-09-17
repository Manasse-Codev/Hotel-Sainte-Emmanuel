import { useEffect, useState } from 'react';
import { api } from '../../../../services/api';

export default function DashboardTab({ user }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.reservations.getMy();
        setReservations(res || []);
      } catch (err) {
        console.warn('Erreur chargement réservations client:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const upcoming = reservations.find((r) => r.status === 'confirmed');
  const totalStays = reservations.length;
  const totalNights = reservations.reduce((acc, r) => {
    if (r.check_in && r.check_out) {
      const n = Math.round((new Date(r.check_out) - new Date(r.check_in)) / (1000 * 60 * 60 * 24));
      return acc + (n > 0 ? n : 1);
    }
    return acc + 1;
  }, 0);

  const loyaltyTier = user?.loyalty_tier || user?.loyalty || 'Standard';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <div className="font-jakarta text-label-md uppercase tracking-widest text-secondary mb-1">
            Bienvenue
          </div>
          <h2 className="font-bodoni text-headline-md text-primary">
            {user?.first_name || user?.firstname} {user?.last_name || user?.lastname}
          </h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-1">
            Hôte Privilégié · Statut {loyaltyTier.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2 border border-outline-variant/30 px-4 py-2 bg-surface">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>
            workspace_premium
          </span>
          <span className="font-jakarta text-label-md uppercase tracking-wider text-on-surface-variant">
            Statut {loyaltyTier.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Séjours', value: totalStays, icon: 'hotel' },
          { label: 'Nuits totales', value: totalNights, icon: 'king_bed' },
          { label: 'Points HSE', value: `${totalNights * 100} pts`, icon: 'star' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-outline-variant/30 p-4 flex flex-col items-center text-center shadow-xs"
          >
            <span className="material-symbols-outlined text-secondary mb-2" style={{ fontSize: '22px' }}>
              {stat.icon}
            </span>
            <div className="font-bodoni text-headline-sm">{stat.value}</div>
            <div className="font-jakarta text-label-sm tracking-wider uppercase text-on-surface-variant mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Prochaine réservation */}
      {upcoming ? (
        <div className="border border-outline-variant/30 p-5 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                upcoming
              </span>
              <span className="font-jakarta text-label-md uppercase tracking-wider font-semibold">
                Prochain Séjour Confirmé
              </span>
            </div>
            <span className="font-mono text-xs text-secondary font-bold">{upcoming.id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-surface-container-low p-4 mb-4 border border-outline-variant/20">
            <div>
              <div className="font-jakarta text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">
                Chambre
              </div>
              <div className="font-bodoni text-headline-sm">{upcoming.room?.name || upcoming.room_id}</div>
            </div>
            <div>
              <div className="font-jakarta text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">
                Arrivée
              </div>
              <div className="font-bodoni text-headline-sm">{upcoming.check_in}</div>
            </div>
            <div>
              <div className="font-jakarta text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">
                Départ
              </div>
              <div className="font-bodoni text-headline-sm">{upcoming.check_out}</div>
            </div>
            <div>
              <div className="font-jakarta text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">
                Montant
              </div>
              <div className="font-bodoni text-headline-sm text-secondary font-bold">
                {upcoming.total_amount?.toLocaleString()} FCFA
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Accueil VIP & Climatisation préparée à l'arrivée.</span>
            <span className="text-secondary font-medium">Réception 24h/24</span>
          </div>
        </div>
      ) : (
        <div className="border border-outline-variant/30 p-8 text-center bg-surface-container-low/50">
          <span className="material-symbols-outlined text-outline-variant mb-2" style={{ fontSize: '32px' }}>
            calendar_month
          </span>
          <h3 className="font-bodoni text-headline-sm">Aucun séjour à venir</h3>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
            Planifiez votre prochaine escapade ou votre mission professionnelle à l'Hôtel Sainte Emmanuelle.
          </p>
        </div>
      )}
    </div>
  );
}
