import { useState, useEffect } from 'react';
import { api } from "../../../../services/api";

export default function ActivityTab() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await api.activities.getMy();
        setActivities(data || []);
      } catch (err) {
        console.warn('Erreur activités:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <h2 className="font-bodoni text-headline-sm">Mon Activité</h2>
        <span className="font-jakarta text-label-sm text-on-surface-variant">
          {activities.length} événement(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement du journal...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-outline-variant/40 p-6">
          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '36px' }}>
            history
          </span>
          <p className="font-bodoni text-headline-sm mt-3 text-on-surface-variant">Aucune activité récente</p>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-1">
            Vos réservations, connexions et paiements s'enregistrent ici.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 pt-2">
          <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-outline-variant/40" />
          {activities.map((item) => (
            <div key={item.id} className="relative mb-6 last:mb-0">
              <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-secondary border-2 border-surface" />
              <div className="font-jakarta text-label-xs tracking-widest uppercase text-secondary mb-1">
                {new Date(item.created_at).toLocaleString('fr-FR')}
              </div>
              <div className="font-jakarta text-body-sm text-on-surface font-medium">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
