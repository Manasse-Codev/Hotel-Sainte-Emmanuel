import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

export default function AuthModal({ mode, isOpen, onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [view, setView] = useState(mode || 'login'); // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setView(mode || 'login');
    setError('');
    setSuccessMsg('');
  }, [mode, isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (view === 'forgot') {
      if (!form.email) {
        setError('Veuillez renseigner votre adresse email.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.auth.forgotPassword(form.email);
        setSuccessMsg(res.message || 'Instructions envoyées.');
      } catch (err) {
        setError(err.message || 'Impossible de traiter la demande.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (view === 'register' && (!form.firstname || !form.lastname)) {
      setError('Veuillez renseigner votre nom et prénom.');
      return;
    }

    setLoading(true);
    try {
      if (view === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          first_name: form.firstname,
          last_name: form.lastname,
          email: form.email,
          password: form.password,
          phone: form.phone || '',
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Échec de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'client') {
      setForm({ firstname: 'Jean', lastname: 'Kouassi', email: 'client@hotel-sainte-emmanuelle.ci', password: 'client1234', phone: '+225 07 08 09 10 11' });
      setView('login');
    } else {
      setForm({ firstname: 'Admin', lastname: 'HSE', email: 'admin@hotel-sainte-emmanuelle.ci', password: 'admin1234', phone: '+225 07 00 00 00 00' });
      setView('login');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface w-full max-w-md relative animate-slide-up shadow-2xl">
        {/* Close */}
        <button
          className="absolute top-4 right-4 p-2 hover:bg-surface-container transition-colors text-on-surface-variant"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>

        {/* Top border accent */}
        <div className="h-[2px] bg-secondary" />

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="font-bodoni text-label-md tracking-widest uppercase text-secondary mb-2">
              {view === 'login' ? 'Connexion' : view === 'register' ? 'Créer un compte' : 'Mot de passe oublié'}
            </div>
            <h2 className="font-bodoni text-headline-md text-primary">
              {view === 'login' ? 'Mon Espace Client' : view === 'register' ? 'Rejoignez-nous' : 'Récupération de compte'}
            </h2>
            <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">
              {view === 'login'
                ? 'Accédez à vos réservations réelles, paiements et avantages fidélité.'
                : view === 'register'
                ? 'Créez votre compte pour réserver et suivre vos séjours à Soubré.'
                : 'Saisissez votre email pour recevoir votre code de réinitialisation.'}
            </p>
          </div>

          {/* Quick Demo Credentials */}
          {view === 'login' && (
            <div className="mb-6 p-3 bg-surface-container-low border border-outline-variant/30 text-xs flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Comptes démo :</span>
              <div className="flex gap-2">
                <button
                  className="px-2.5 py-1 bg-surface border border-outline-variant/50 text-primary hover:border-primary transition-colors text-label-xs font-semibold"
                  onClick={() => fillDemo('client')}
                  type="button"
                >
                  Client Démo
                </button>
                <button
                  className="px-2.5 py-1 bg-surface border border-outline-variant/50 text-secondary hover:border-secondary transition-colors text-label-xs font-semibold"
                  onClick={() => fillDemo('admin')}
                  type="button"
                >
                  Admin HSE
                </button>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {view === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
                      Prénom *
                    </label>
                    <input
                      className="w-full border border-outline-variant px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none transition-colors"
                      name="firstname"
                      onChange={handleChange}
                      placeholder="Jean"
                      required
                      type="text"
                      value={form.firstname}
                    />
                  </div>
                  <div>
                    <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
                      Nom *
                    </label>
                    <input
                      className="w-full border border-outline-variant px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none transition-colors"
                      name="lastname"
                      onChange={handleChange}
                      placeholder="Kouassi"
                      required
                      type="text"
                      value={form.lastname}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
                    Téléphone
                  </label>
                  <input
                    className="w-full border border-outline-variant px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none transition-colors"
                    name="phone"
                    onChange={handleChange}
                    placeholder="+225 07 xx xx xx xx"
                    type="tel"
                    value={form.phone}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
                Adresse e-mail *
              </label>
              <input
                autoComplete="email"
                className="w-full border border-outline-variant px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none transition-colors"
                name="email"
                onChange={handleChange}
                placeholder="vous@email.com"
                required
                type="email"
                value={form.email}
              />
            </div>

            {view !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant">
                    Mot de passe *
                  </label>
                  {view === 'login' && (
                    <button
                      className="text-xs text-secondary hover:underline"
                      onClick={() => setView('forgot')}
                      type="button"
                    >
                      Oublié ?
                    </button>
                  )}
                </div>
                <input
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  className="w-full border border-outline-variant px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none transition-colors"
                  name="password"
                  onChange={handleChange}
                  placeholder={view === 'register' ? 'Min. 6 caractères' : '••••••••'}
                  required
                  type="password"
                  value={form.password}
                />
              </div>
            )}

            {error && (
              <p className="font-jakarta text-body-sm text-error bg-error-container/30 px-4 py-2">{error}</p>
            )}

            {successMsg && (
              <p className="font-jakarta text-body-sm text-primary bg-surface-container px-4 py-2">{successMsg}</p>
            )}

            <button
              className={`w-full py-4 text-label-md tracking-widest uppercase flex items-center justify-center gap-2 transition-colors ${
                loading ? 'bg-neutral-600 cursor-not-allowed text-white' : 'bg-primary text-on-primary hover:bg-neutral-800'
              }`}
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                  {view === 'login' ? 'Connexion...' : view === 'register' ? 'Création...' : 'Envoi...'}
                </>
              ) : (
                view === 'login' ? 'Se connecter' : view === 'register' ? 'Créer mon compte' : 'Envoyer le lien'
              )}
            </button>
          </form>

          {/* Switch view */}
          <div className="mt-6 pt-6 border-t border-outline-variant/30 text-center">
            {view === 'login' ? (
              <p className="font-jakarta text-body-sm text-on-surface-variant">
                Pas encore de compte ?{' '}
                <button
                  className="font-medium text-secondary hover:underline"
                  onClick={() => setView('register')}
                  type="button"
                >
                  Créer un compte
                </button>
              </p>
            ) : (
              <p className="font-jakarta text-body-sm text-on-surface-variant">
                Déjà client ?{' '}
                <button
                  className="font-medium text-secondary hover:underline"
                  onClick={() => setView('login')}
                  type="button"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
