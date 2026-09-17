import { useState, useEffect } from 'react';
import { api } from "../../../../services/api";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      const data = await api.reviews.getMy();
      setReviews(data || []);
    } catch (err) {
      console.warn('Erreur avis:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      setError('Veuillez écrire un commentaire.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.reviews.create({
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      });
      setSubmitted(true);
      setNewReview({ rating: 5, comment: '' });
      await fetchReviews();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.message || 'Impossible d\'enregistrer votre avis.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <h2 className="font-bodoni text-headline-sm">Mes Avis</h2>
        <span className="font-jakarta text-label-sm text-on-surface-variant">
          {reviews.length} avis publié(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement de vos avis...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-outline-variant/40 p-6">
          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '36px' }}>
            rate_review
          </span>
          <p className="font-bodoni text-headline-sm mt-3 text-on-surface-variant">Aucun avis rédigé</p>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-1">
            Partagez votre retour d'expérience sur votre dernier séjour à Soubré.
          </p>
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border border-outline-variant/30 p-5 bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bodoni text-headline-sm">
                Séjour à l'Hôtel Sainte Emmanuelle
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined ${
                      i < review.rating ? 'text-secondary' : 'text-outline-variant'
                    }`}
                    style={{ fontSize: '18px', fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <p className="font-jakarta text-body-sm text-on-surface-variant">{review.comment}</p>
            <div className="font-jakarta text-label-xs text-on-surface-variant">
              Déposé le {new Date(review.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))
      )}

      {/* Formulaire Nouvel Avis */}
      <div className="border border-outline-variant/30 p-6 bg-surface">
        <h3 className="font-bodoni text-headline-sm mb-4">Laisser une nouvelle appréciation</h3>
        {submitted ? (
          <div className="text-center py-6 bg-surface-container/20 border border-primary/20">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '36px' }}>
              check_circle
            </span>
            <p className="font-bodoni text-headline-sm mt-2">Merci pour votre retour d'expérience !</p>
            <p className="font-jakarta text-body-sm text-on-surface-variant mt-1">
              Votre avis contribue à faire vivre l'excellence de l'hospitalité à Soubré.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-jakarta text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Note globale
              </label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    className="p-1 hover:scale-110 transition-transform"
                    onClick={() => setNewReview((r) => ({ ...r, rating: i + 1 }))}
                    type="button"
                  >
                    <span
                      className={`material-symbols-outlined transition-colors ${
                        i < newReview.rating ? 'text-secondary' : 'text-outline-variant hover:text-secondary'
                      }`}
                      style={{ fontSize: '28px', fontVariationSettings: i < newReview.rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
                <span className="font-bodoni text-headline-sm text-secondary ml-2 font-bold">
                  {newReview.rating} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="block font-jakarta text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Votre commentaire
              </label>
              <textarea
                className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none resize-none"
                onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value }))}
                placeholder="Partagez vos impressions sur la chambre, le service, le calme..."
                required
                rows={3}
                value={newReview.comment}
              />
            </div>

            {error && (
              <p className="font-jakarta text-body-sm text-error bg-error-container/30 px-4 py-2 border border-error/20">
                {error}
              </p>
            )}

            <button
              className="bg-primary text-on-primary px-6 py-3 text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50"
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Envoi...' : 'Publier mon avis'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
