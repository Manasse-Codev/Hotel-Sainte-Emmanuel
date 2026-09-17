import { useEffect, useRef, useState } from 'react';
import { rooms as fallbackRooms } from '../../../data/rooms';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

export default function ContactSection({ onOpenAuth, onOpenClientSpace, selectedRoom }) {
  const sectionRef = useRef(null);
  const { user } = useAuth();
  const [roomsList, setRoomsList] = useState(fallbackRooms);
  const [form, setForm] = useState({
    fullname: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    phone: user?.phone || '',
    adults: '1',
    checkin: '',
    checkout: '',
    room: selectedRoom || '',
    message: '',
  });
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [error, setError] = useState('');

  // Fetch real rooms
  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await api.rooms.getAll();
        if (Array.isArray(data) && data.length > 0) {
          setRoomsList(data);
        }
      } catch (err) {
        console.warn('Rooms fallback:', err.message);
      }
    }
    loadRooms();
  }, []);

  // Sync selectedRoom prop
  useEffect(() => {
    if (selectedRoom) {
      setForm((f) => ({ ...f, room: selectedRoom }));
    }
  }, [selectedRoom]);

  // Sync user info if user logs in
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        fullname: f.fullname || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: f.phone || user.phone || '',
      }));

      // Check if there was a pending reservation saved before logging in
      const pending = sessionStorage.getItem('pending_reservation');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          setForm(parsed);
          sessionStorage.removeItem('pending_reservation');
          // Auto submit booking if valid
          if (parsed.room && parsed.checkin && parsed.checkout) {
            handleCreateReservation(parsed);
          }
        } catch {
          sessionStorage.removeItem('pending_reservation');
        }
      }
    }
  }, [user]);

  // Reveal animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Check availability whenever room, checkin or checkout changes
  useEffect(() => {
    if (!form.room || !form.checkin || !form.checkout) {
      setAvailability(null);
      return;
    }

    if (form.checkout <= form.checkin) {
      setAvailability({ available: false, message: 'La date de départ doit être après l\'arrivée.' });
      return;
    }

    let isMounted = true;
    setCheckingAvail(true);
    setError('');

    api.reservations.checkAvailability(form.room, form.checkin, form.checkout)
      .then((res) => {
        if (isMounted) setAvailability(res);
      })
      .catch((err) => {
        if (isMounted) {
          // Calculate client-side fallback
          const roomObj = roomsList.find((r) => r.id === form.room);
          const price = roomObj?.price || 45000;
          const nights = Math.max(1, Math.round((new Date(form.checkout) - new Date(form.checkin)) / (1000 * 60 * 60 * 24)));
          setAvailability({
            available: true,
            nights,
            price_per_night: price,
            total_amount: nights * price,
            message: 'Chambre disponible.',
          });
        }
      })
      .finally(() => {
        if (isMounted) setCheckingAvail(false);
      });

    return () => { isMounted = false; };
  }, [form.room, form.checkin, form.checkout, roomsList]);

  const handleChange = (e) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreateReservation = async (reservationData) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.reservations.create({
        room_id: reservationData.room,
        guest_name: reservationData.fullname,
        phone: reservationData.phone,
        check_in: reservationData.checkin,
        check_out: reservationData.checkout,
        guests: parseInt(reservationData.adults, 10) || 1,
        special_requests: reservationData.message || undefined,
      });
      setCreatedReservation(res);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Impossible de confirmer la réservation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullname || !form.phone || !form.checkin || !form.checkout || !form.room) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!user) {
      // Store reservation context so it is never lost during authentication
      sessionStorage.setItem('pending_reservation', JSON.stringify(form));
      onOpenAuth('login');
      return;
    }

    handleCreateReservation(form);
  };

  const selectedRoomObj = roomsList.find((r) => r.id === form.room);

  return (
    <section
      className="chapter-section flex flex-col justify-center py-24 px-6 md:px-12 bg-surface-container-low"
      id="contact"
    >
      <div ref={sectionRef} className="reveal max-w-7xl mx-auto w-full" id="reservation">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-label-sm tracking-widest text-on-surface-variant">07</span>
            <div className="w-12 h-[1px] bg-outline-variant" />
            <span className="text-label-sm tracking-widest uppercase text-secondary font-medium">
              Contact & Réservation
            </span>
          </div>
          <h2 className="font-bodoni text-headline-lg">Réserver votre séjour.</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          {/* Formulaire */}
          <div>
            {submitted && createdReservation ? (
              <div className="border border-outline-variant/30 bg-surface p-10 flex flex-col items-center text-center gap-4 animate-fade-in shadow-sm">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '48px' }}>
                  check_circle
                </span>
                <div className="space-y-1">
                  <span className="font-jakarta text-label-sm uppercase tracking-widest text-secondary font-medium">
                    Confirmation Immédiate
                  </span>
                  <h3 className="font-bodoni text-headline-md">Réservation Confirmée !</h3>
                </div>
                
                <div className="bg-surface-container-low p-6 border border-outline-variant/30 w-full text-left space-y-2 font-jakarta text-body-sm my-2">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant">Référence :</span>
                    <span className="font-bold text-primary font-mono">{createdReservation.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant">Chambre :</span>
                    <span className="font-medium text-on-surface">{selectedRoomObj?.name || createdReservation.room_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant">Période :</span>
                    <span className="text-on-surface">{createdReservation.check_in} au {createdReservation.check_out}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-on-surface-variant font-medium">Montant total :</span>
                    <span className="font-bodoni text-headline-sm text-secondary font-bold">
                      {createdReservation.total_amount?.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <p className="font-jakarta text-body-sm text-on-surface-variant max-w-sm">
                  Votre réservation a bien été enregistrée dans notre système. Vous pouvez consulter les détails et vos reçus dans votre espace.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                  {onOpenClientSpace && (
                    <button
                      className="flex-1 bg-primary text-on-primary py-3 px-4 text-label-sm tracking-widest uppercase hover:bg-neutral-800 transition-colors"
                      onClick={onOpenClientSpace}
                      type="button"
                    >
                      Mon Espace Client
                    </button>
                  )}
                  <button
                    className="flex-1 border border-outline-variant py-3 px-4 text-label-sm tracking-widest uppercase hover:bg-surface-container transition-colors"
                    onClick={() => {
                      setSubmitted(false);
                      setCreatedReservation(null);
                      setForm((f) => ({ ...f, checkin: '', checkout: '', message: '' }));
                    }}
                    type="button"
                  >
                    Nouvelle réservation
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant mb-2">
                      Nom complet *
                    </label>
                    <input
                      className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-md focus:border-primary focus:outline-none transition-colors"
                      name="fullname"
                      onChange={handleChange}
                      placeholder="Votre nom complet"
                      required
                      type="text"
                      value={form.fullname}
                    />
                  </div>

                  <div>
                    <label className="block font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant mb-2">
                      Téléphone *
                    </label>
                    <input
                      className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-md focus:border-primary focus:outline-none transition-colors"
                      name="phone"
                      onChange={handleChange}
                      placeholder="+225 xx xx xx xx"
                      required
                      type="tel"
                      value={form.phone}
                    />
                  </div>

                  <div>
                    <label className="block font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant mb-2">
                      Adultes
                    </label>
                    <select
                      className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-md focus:border-primary focus:outline-none transition-colors"
                      name="adults"
                      onChange={handleChange}
                      value={form.adults}
                    >
                      <option value="1">1 adulte</option>
                      <option value="2">2 adultes</option>
                      <option value="3">3 adultes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant mb-2">
                      Arrivée *
                    </label>
                    <input
                      className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-md focus:border-primary focus:outline-none transition-colors"
                      min={new Date().toISOString().split('T')[0]}
                      name="checkin"
                      onChange={handleChange}
                      required
                      type="date"
                      value={form.checkin}
                    />
                  </div>

                  <div>
                    <label className="block font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant mb-2">
                      Départ *
                    </label>
                    <input
                      className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-md focus:border-primary focus:outline-none transition-colors"
                      min={form.checkin || new Date().toISOString().split('T')[0]}
                      name="checkout"
                      onChange={handleChange}
                      required
                      type="date"
                      value={form.checkout}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant mb-2">
                      Chambre souhaitée *
                    </label>
                    <select
                      className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-md focus:border-primary focus:outline-none transition-colors"
                      name="room"
                      onChange={handleChange}
                      required
                      value={form.room}
                    >
                      <option value="">Sélectionner une chambre</option>
                      {roomsList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — {r.price_display || `${r.price} FCFA`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Real Availability Banner */}
                  {availability && (
                    <div className="col-span-2">
                      <div
                        className={`p-4 border text-body-sm font-jakarta flex items-center justify-between ${
                          availability.available
                            ? 'bg-surface border-outline-variant/50 text-on-surface'
                            : 'bg-error-container/30 border-error/40 text-error'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {availability.available ? 'check_circle' : 'info'}
                          </span>
                          <span>{availability.message}</span>
                        </div>
                        {availability.available && availability.total_amount > 0 && (
                          <div className="font-bodoni text-headline-sm text-secondary font-bold">
                            {availability.total_amount?.toLocaleString()} FCFA
                            <span className="text-xs font-jakarta font-normal text-on-surface-variant block">
                              ({availability.nights} nuit{availability.nights > 1 ? 's' : ''})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block font-jakarta text-label-md tracking-widest uppercase text-on-surface-variant mb-2">
                      Demandes particulières
                    </label>
                    <textarea
                      className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-md focus:border-primary focus:outline-none transition-colors resize-none"
                      name="message"
                      onChange={handleChange}
                      placeholder="Heure d'arrivée estimée, préférences de literie..."
                      rows={3}
                      value={form.message}
                    />
                  </div>
                </div>

                {!user && (
                  <p className="font-jakarta text-body-sm text-on-surface-variant border border-secondary-container bg-secondary-container/20 p-3">
                    <span className="material-symbols-outlined align-middle mr-1 text-secondary" style={{ fontSize: '14px' }}>
                      info
                    </span>
                    Votre réservation sera automatiquement validée dès votre connexion ou inscription.{' '}
                    <button
                      className="underline text-secondary font-medium"
                      onClick={() => onOpenAuth('login')}
                      type="button"
                    >
                      Se connecter maintenant
                    </button>
                  </p>
                )}

                {error && (
                  <p className="font-jakarta text-body-sm text-error bg-error-container/30 px-4 py-3 border border-error/20">
                    {error}
                  </p>
                )}

                <button
                  className={`w-full py-4 text-label-md tracking-widest uppercase transition-colors font-medium flex items-center justify-center gap-2 ${
                    submitting
                      ? 'bg-neutral-700 text-white cursor-not-allowed'
                      : 'bg-primary text-on-primary hover:bg-neutral-800'
                  }`}
                  disabled={submitting || (availability && !availability.available)}
                  type="submit"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>
                        progress_activity
                      </span>
                      Validation de votre réservation...
                    </>
                  ) : (
                    'Confirmer la réservation'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Coordonnées & Infos */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="border-b border-outline-variant/30 pb-6">
                <span className="text-label-sm tracking-widest uppercase text-secondary block mb-1">
                  Adresse & Accès
                </span>
                <div className="font-bodoni text-headline-sm mb-1">Hôtel Sainte Emmanuelle</div>
                <p className="font-jakarta text-body-md text-on-surface-variant">
                  Quartier Résidentiel, Ville de Soubré<br />
                  Région de la Nawa — Côte d'Ivoire
                </p>
              </div>

              <div className="border-b border-outline-variant/30 pb-6 space-y-3">
                <span className="text-label-sm tracking-widest uppercase text-secondary block mb-1">
                  Assistance & Renseignements
                </span>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                    call
                  </span>
                  <a className="font-jakarta text-body-md hover:text-secondary transition-colors" href="tel:+2250707123456">
                    +225 07 07 12 34 56
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                    mail
                  </span>
                  <a className="font-jakarta text-body-md hover:text-secondary transition-colors" href="mailto:contact@hotel-sainte-emmanuelle.ci">
                    contact@hotel-sainte-emmanuelle.ci
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                    schedule
                  </span>
                  <span className="font-jakarta text-body-md text-on-surface-variant">
                    Réception ouverte 24h/24 — 7j/7
                  </span>
                </div>
              </div>

              <div className="p-6 bg-surface border border-outline-variant/30 space-y-2">
                <div className="font-bodoni text-title-md">Garantie Meilleur Tarif</div>
                <p className="font-jakarta text-body-sm text-on-surface-variant font-light">
                  En réservant directement via notre portail officiel, vous bénéficiez de l'accueil prioritaire,
                  de l'annulation flexible et du cumul automatique de vos points privilèges HSE.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
