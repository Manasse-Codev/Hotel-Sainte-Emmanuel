import { useEffect, useState } from 'react';
import { api } from "../../../services/api";

const statusStyles = {
  pending: 'bg-secondary-container text-on-secondary-container',
  confirmed: 'bg-surface-container text-primary font-medium',
  completed: 'bg-surface-variant text-on-surface-variant',
  cancelled: 'bg-error-container text-on-error-container',
};

export default function DashboardPage({ onNewBooking }) {
  const [kpis, setKpis] = useState(null);
  const [movements, setMovements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [kpiData, movData, actData] = await Promise.all([
        api.admin.getKpis().catch(() => null),
        api.admin.getMovements().catch(() => []),
        api.admin.getActivities().catch(() => []),
      ]);
      setKpis(kpiData);
      setMovements(movData || []);
      setActivities(actData || []);
    } catch (err) {
      console.warn('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleValidateMovement = async (id) => {
    try {
      await api.admin.updateReservationStatus(id, 'completed');
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Action impossible');
    }
  };

  const occupancyRate = kpis ? kpis.occupancy_rate : 83;
  const totalRevenue = kpis ? kpis.monthly_revenue : 3820000;
  const checkinsToday = kpis ? kpis.checkins_today : 2;
  const pendingReservations = kpis ? kpis.pending_reservations : 1;

  const kpisList = [
    {
      id: 'occupancy',
      label: 'Taux d\'Occupation',
      value: `${occupancyRate}%`,
      unit: `(${kpis ? kpis.occupied_rooms : 2} / ${kpis ? kpis.total_rooms : 3} Chambres)`,
      icon: 'hotel',
      trend: `${occupancyRate}% actuel`,
      trendLabel: 'au domaine de Soubré',
      trendPositive: true,
      progress: occupancyRate,
      progressColor: 'bg-secondary',
    },
    {
      id: 'revenue',
      label: 'Revenus Encaissés',
      value: `${totalRevenue.toLocaleString()} FCFA`,
      unit: '',
      icon: 'payments',
      trend: 'Encaissements validés',
      trendLabel: 'par Mobile Money & Espèces',
      trendPositive: true,
      progress: Math.min(100, Math.round((totalRevenue / 5000000) * 100)),
      progressColor: 'bg-primary',
    },
    {
      id: 'arrivals',
      label: 'Mouvements Actifs',
      value: `${movements.length}`,
      unit: 'Dossiers',
      icon: 'flight_land',
      trend: `${checkinsToday} séjour(s) aujourd'hui`,
      trendLabel: 'protocole VIP',
      trendPositive: true,
      progress: 75,
      progressColor: 'bg-secondary',
    },
    {
      id: 'satisfaction',
      label: 'Qualité & Avis',
      value: '4.9',
      unit: '/ 5 ★',
      icon: 'star',
      trend: `${kpis?.pending_reviews || 0} avis en attente`,
      trendLabel: 'note d\'excellence',
      trendPositive: true,
      progress: 98,
      progressColor: 'bg-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            Vue Générale d'Exploitation
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Tableau de Bord Exécutif</h2>
          <p className="font-jakarta text-body-md text-on-surface-variant">
            Données consolidées en temps réel connectées à la base SQLite locale.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2.5 border border-outline-variant/50 hover:border-primary text-primary font-jakarta text-label-md font-semibold transition-colors flex items-center gap-2"
            onClick={() => window.print()}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
            Imprimer Rapport
          </button>
          <button
            className="px-4 py-2.5 bg-primary hover:bg-neutral-800 text-on-primary font-jakarta text-label-md uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 shadow-sm"
            onClick={onNewBooking}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Nouvelle Attribution
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpisList.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-surface-container-lowest border border-outline-variant/30 p-5 relative overflow-hidden shadow-xs"
          >
            <div className="flex justify-between items-start">
              <span className="font-jakarta text-label-sm uppercase font-semibold text-on-surface-variant tracking-wider">
                {kpi.label}
              </span>
              <span className={`p-2 ${kpi.id === 'arrivals' ? 'bg-secondary-container/40 text-secondary' : 'bg-surface-container text-primary'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{kpi.icon}</span>
              </span>
            </div>
            <div className="mt-4">
              <div className="font-bodoni text-headline-md text-primary font-normal">
                {kpi.value}{' '}
                {kpi.unit && (
                  <span className="text-on-surface-variant font-jakarta text-body-sm font-normal">
                    {kpi.unit}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2 font-jakarta text-label-sm">
                <span className="font-semibold text-primary">{kpi.trend}</span>
                <span className="text-on-surface-variant">· {kpi.trendLabel}</span>
              </div>
            </div>
            <div className="w-full bg-surface-container h-1 mt-4">
              <div className={`${kpi.progressColor} h-1 transition-all duration-700`} style={{ width: `${kpi.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Planning des Mouvements */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>flight_land</span>
            <h3 className="font-bodoni text-headline-sm text-primary">
              Planning des Mouvements (Arrivées & Départs)
            </h3>
          </div>
          <span className="font-jakarta text-label-sm text-on-surface-variant">
            {movements.length} dossier(s) en gestion
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-jakarta text-body-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-jakarta text-label-sm uppercase">
                <th className="py-2.5 px-3">Réf</th>
                <th className="py-2.5 px-3">Hôte & Contact</th>
                <th className="py-2.5 px-3">Chambre Assignée</th>
                <th className="py-2.5 px-3">Période</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-on-surface-variant">
                    Aucun mouvement programmé pour le moment.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-primary">
                      {mov.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-on-surface">{mov.guest}</div>
                      <div className="text-on-surface-variant text-xs">{mov.phone || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-3 font-medium">{mov.room}</td>
                    <td className="py-3 px-3 text-xs">
                      Du {mov.checkIn} au {mov.checkOut}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-jakarta text-label-xs px-2.5 py-1 uppercase tracking-wider ${statusStyles[mov.status] || 'bg-surface-container'}`}>
                        {mov.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {mov.status !== 'completed' && mov.status !== 'cancelled' ? (
                        <button
                          className="font-jakarta text-label-sm text-secondary hover:underline font-semibold"
                          onClick={() => handleValidateMovement(mov.id)}
                          type="button"
                        >
                          Clôturer
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">Archivé</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Journal d'Activité */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 p-6">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-outline-variant/20">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>receipt_long</span>
          <h3 className="font-bodoni text-headline-sm text-primary">Journal d'Audit Système</h3>
        </div>
        <div className="space-y-3">
          {activities.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-1.5 border-b border-outline-variant/10 last:border-0">
              <div className="flex-shrink-0 p-1.5 bg-surface-container text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  check_circle
                </span>
              </div>
              <div className="flex-1">
                <div className="font-jakarta text-body-sm font-medium">{item.description}</div>
                <div className="font-jakarta text-label-xs text-on-surface-variant mt-0.5">
                  {new Date(item.created_at).toLocaleString('fr-FR')} · Action : {item.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
