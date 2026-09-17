import { useEffect, useState } from 'react';
import { api } from "../../../services/api";

const loyaltyStyles = {
  gold: 'bg-secondary-container text-on-secondary-container font-semibold',
  silver: 'bg-surface-container text-primary font-medium',
  standard: 'bg-surface-variant text-on-surface-variant',
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await api.admin.getClients();
        setClients(data || []);
      } catch (err) {
        console.warn('Erreur clients admin:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            Base Clientèle
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Répertoire Clients</h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
            Historique de séjours, dépenses cumulées et fidélité calculés depuis SQLite.
          </p>
        </div>
        <span className="font-jakarta text-label-md text-on-surface-variant font-medium">
          {clients.length} client(s) inscrit(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement des clients...</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-jakarta text-body-sm bg-surface-container-lowest border border-outline-variant/30">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-jakarta text-label-sm uppercase">
                {['ID', 'Client', 'Contact', 'Séjours', 'Total Dépensé', 'Fidélité', 'Membre Depuis'].map((h) => (
                  <th key={h} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    Aucun client enregistré pour l'instant.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 text-on-surface-variant font-mono text-xs">#{client.id}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{client.name}</td>
                    <td className="py-3 px-4">
                      <div>{client.email}</div>
                      <div className="text-on-surface-variant text-[11px]">{client.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-bold">{client.stays}</td>
                    <td className="py-3 px-4 font-bodoni text-headline-sm text-secondary font-bold">
                      {client.spent?.toLocaleString()} FCFA
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-jakarta text-label-xs px-2.5 py-1 uppercase tracking-wider ${loyaltyStyles[client.tier] || loyaltyStyles.standard}`}>
                        {client.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant">{client.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
