import { useEffect, useState } from 'react';
import { api } from "../../../services/api";

export default function AvisPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReviews = async () => {
    try {
      const data = await api.admin.getReviews();
      setReviews(data || []);
    } catch (err) {
      console.warn('Erreur avis admin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.admin.updateReviewStatus(id, status);
      await fetchReviews();
    } catch (err) {
      alert(err.message || 'Impossible de modérer cet avis');
    } finally {
      setUpdatingId(null);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            Qualité & E-Réputation
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Modération des Avis</h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
            Validation et modération des retours d'expérience clients.
          </p>
        </div>
        <div className="font-bodoni text-headline-md text-secondary font-bold">
          {avgRating}★ <span className="font-jakarta text-body-sm text-on-surface-variant font-normal">/ 5.0 — {reviews.length} avis</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement des avis...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-outline-variant/40 p-6">
          <p className="font-bodoni text-headline-sm text-on-surface-variant">Aucun avis soumis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-surface-container-lowest border border-outline-variant/30 p-5 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-container text-primary flex items-center justify-center font-jakarta text-label-md font-bold">
                    {review.user?.first_name ? review.user.first_name[0] : 'C'}
                  </div>
                  <div>
                    <div className="font-jakarta text-body-sm font-semibold">
                      {review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Client HSE'}
                    </div>
                    <div className="font-jakarta text-label-xs text-on-surface-variant">
                      Réf séjour : {review.reservation_id || 'Direct'} · Déposé le {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined ${i < review.rating ? 'text-secondary' : 'text-outline-variant'}`}
                        style={{ fontSize: '16px', fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span
                    className={`font-jakarta text-label-xs px-2.5 py-1 uppercase tracking-wider ${
                      review.status === 'approved'
                        ? 'bg-surface-container text-primary font-semibold'
                        : review.status === 'pending'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {review.status === 'approved' ? 'Publié' : review.status === 'pending' ? 'En attente' : 'Rejeté'}
                  </span>
                </div>
              </div>

              <p className="font-jakarta text-body-sm text-on-surface-variant bg-surface p-3 border border-outline-variant/20">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-3 pt-1">
                {review.status !== 'approved' && (
                  <button
                    className="bg-primary text-on-primary px-3 py-1 text-label-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    disabled={updatingId === review.id}
                    onClick={() => handleStatusChange(review.id, 'approved')}
                    type="button"
                  >
                    Approuver
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button
                    className="border border-error text-error px-3 py-1 text-label-xs uppercase tracking-wider hover:bg-error-container/20 transition-colors disabled:opacity-50"
                    disabled={updatingId === review.id}
                    onClick={() => handleStatusChange(review.id, 'rejected')}
                    type="button"
                  >
                    Rejeter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
