import { useEffect, useState } from 'react';
import { api } from '../../../services/api';

const payStatusStyles = {
  validated: 'bg-surface-container text-primary font-semibold',
  pending: 'bg-secondary-container text-on-secondary-container',
  failed: 'bg-error-container text-on-error-container',
};

export default function PaiementsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPayments = async () => {
    try {
      const data = await api.admin.getPayments();
      setPayments(data || []);
    } catch (err) {
      console.warn('Erreur paiements admin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'validated' ? 'pending' : 'validated';
    setUpdatingId(id);
    try {
      await api.admin.updatePaymentStatus(id, nextStatus);
      await fetchPayments();
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour le paiement');
    } finally {
      setUpdatingId(null);
    }
  };

  const total = payments
    .filter((p) => p.status === 'validated')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant/30 pb-4">
        <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
          Finance & Trésorerie
        </span>
        <h2 className="font-bodoni text-headline-lg text-primary mt-1">Paiements & Encaissements</h2>
        <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
          Suivi des encaissements par passerelles Wave, Orange Money et Espèces.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '36px' }}>
            account_balance_wallet
          </span>
          <div>
            <div className="font-jakarta text-label-sm uppercase tracking-widest text-on-surface-variant">
              Total Encaissé (Période Actuelle)
            </div>
            <div className="font-bodoni text-headline-md text-primary font-bold">
              {total.toLocaleString('fr-FR')} FCFA
            </div>
          </div>
        </div>
        <span className="font-jakarta text-label-sm text-on-surface-variant">
          {payments.length} transaction(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement des transactions...</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-jakarta text-body-sm bg-surface-container-lowest border border-outline-variant/30">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-jakarta text-label-sm uppercase">
                {['ID Paiement', 'Réservation', 'Montant', 'Méthode', 'Référence', 'Date', 'Statut', 'Action'].map((h) => (
                  <th key={h} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                    Aucun paiement enregistré pour l'instant.
                  </td>
                </tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{pay.id}</td>
                    <td className="py-3 px-4 font-mono">{pay.reservation_id}</td>
                    <td className="py-3 px-4 font-bodoni text-headline-sm text-secondary font-bold">
                      {pay.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-4 font-medium">{pay.payment_method}</td>
                    <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">{pay.transaction_reference || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant">
                      {new Date(pay.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-jakarta text-label-xs px-2.5 py-1 uppercase tracking-wider ${payStatusStyles[pay.status] || 'bg-surface-container'}`}>
                        {pay.status === 'validated' ? 'Validé' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="font-jakarta text-label-xs uppercase font-semibold text-secondary hover:underline disabled:opacity-50"
                        disabled={updatingId === pay.id}
                        onClick={() => handleToggleStatus(pay.id, pay.status)}
                        type="button"
                      >
                        {pay.status === 'validated' ? 'Basculer en attente' : 'Valider'}
                      </button>
                    </td>
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
