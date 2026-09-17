import { useEffect, useState } from 'react';
import { api } from '../../../../services/api';

export default function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await api.payments.getMy();
        setPayments(data || []);
      } catch (err) {
        console.warn('Erreur chargement paiements:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <h2 className="font-bodoni text-headline-sm">Mes Paiements</h2>
        <span className="font-jakarta text-label-md text-on-surface-variant">
          {payments.length} transaction(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement de vos transactions...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-outline-variant/40 p-8">
          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '36px' }}>
            receipt_long
          </span>
          <p className="font-bodoni text-headline-sm mt-3 text-on-surface-variant">Aucun paiement enregistré</p>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-1">
            Vos factures et règlements apparaîtront ici dès la validation de votre séjour.
          </p>
        </div>
      ) : (
        payments.map((pay) => (
          <div
            key={pay.id}
            className="border border-outline-variant/30 p-5 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-outline-variant transition-colors"
          >
            <div>
              <div className="font-bodoni text-headline-sm">Règlement Réservation {pay.reservation_id}</div>
              <div className="font-jakarta text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
                <span>Réf : {pay.id}</span>
                <span>·</span>
                <span>{new Date(pay.created_at).toLocaleDateString('fr-FR')}</span>
                <span>·</span>
                <span className="font-medium text-on-surface">{pay.payment_method}</span>
                {pay.transaction_reference && (
                  <span className="font-mono text-xs text-on-surface-variant/80">({pay.transaction_reference})</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bodoni text-headline-sm text-secondary font-bold">
                {pay.amount.toLocaleString('fr-FR')} FCFA
              </span>
              <span
                className={`px-3 py-1 font-jakarta text-label-md tracking-wider uppercase ${
                  pay.status === 'validated'
                    ? 'bg-surface-container text-primary font-medium'
                    : 'bg-secondary-container text-on-secondary-container'
                }`}
              >
                {pay.status === 'validated' ? 'Validé' : 'En attente'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
