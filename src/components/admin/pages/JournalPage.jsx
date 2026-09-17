import { useEffect, useState } from 'react';
import { api } from '../../../services/api';

export default function JournalPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await api.admin.getActivities();
        setActivities(data || []);
      } catch (err) {
        console.warn('Erreur journal admin:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            Traçabilité & Sécurité
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Journal & Audit</h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
            Historique infalsifiable de toutes les opérations clients et administratives.
          </p>
        </div>
        <span className="font-jakarta text-label-md text-on-surface-variant">
          {activities.length} entrée(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement du journal d'audit...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-outline-variant/40 p-6">
          <p className="font-bodoni text-headline-sm text-on-surface-variant">Aucune entrée au journal</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 space-y-4 shadow-xs">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 pb-4 border-b border-outline-variant/10 last:border-0 last:pb-0 hover:bg-surface-container-low/50 p-2 rounded transition-colors"
            >
              <div className="flex-shrink-0 p-2 bg-surface-container text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  security
                </span>
              </div>
              <div className="flex-1">
                <div className="font-jakarta text-body-sm font-semibold text-primary">
                  {item.description}
                </div>
                <div className="font-jakarta text-label-xs text-on-surface-variant mt-1 flex items-center gap-2">
                  <span className="font-mono text-secondary">#{item.id}</span>
                  <span>·</span>
                  <span className="font-medium uppercase">{item.action}</span>
                  <span>·</span>
                  <span>{new Date(item.created_at).toLocaleString('fr-FR')}</span>
                  {item.user_id && (
                    <>
                      <span>·</span>
                      <span>Utilisateur #{item.user_id}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
