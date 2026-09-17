import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from "../../../../services/api";

export default function ProfileTab() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstname: user?.first_name || user?.firstname || '',
    lastname: user?.last_name || user?.lastname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await api.users.updateProfile({
        first_name: form.firstname,
        last_name: form.lastname,
        phone: form.phone,
        password: form.password || undefined,
      });
      updateUser(updated);
      setSaved(true);
      setForm((f) => ({ ...f, password: '' }));
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-bodoni text-headline-sm pb-4 border-b border-outline-variant/20">Mon Profil</h2>

      <form className="space-y-5 max-w-lg" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
              Prénom
            </label>
            <input
              className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none"
              name="firstname"
              onChange={handleChange}
              type="text"
              value={form.firstname}
            />
          </div>
          <div>
            <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
              Nom
            </label>
            <input
              className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none"
              name="lastname"
              onChange={handleChange}
              type="text"
              value={form.lastname}
            />
          </div>
        </div>

        <div>
          <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
            E-mail
          </label>
          <input
            className="w-full border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-jakarta text-body-sm text-on-surface-variant cursor-not-allowed"
            disabled
            name="email"
            type="email"
            value={form.email}
          />
          <span className="text-xs text-on-surface-variant mt-1 block">L'identifiant email n'est pas modifiable.</span>
        </div>

        <div>
          <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
            Téléphone
          </label>
          <input
            className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none"
            name="phone"
            onChange={handleChange}
            placeholder="+225 xx xx xx xx"
            type="tel"
            value={form.phone}
          />
        </div>

        <div>
          <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">
            Nouveau mot de passe (optionnel)
          </label>
          <input
            className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none"
            name="password"
            onChange={handleChange}
            placeholder="Laisser vide pour ne pas changer"
            type="password"
            value={form.password}
          />
        </div>

        {saved && (
          <p className="font-jakarta text-body-sm text-primary bg-surface-container px-4 py-2 border border-primary/20">
            ✓ Vos informations ont été enregistrées avec succès en base de données.
          </p>
        )}

        {error && (
          <p className="font-jakarta text-body-sm text-error bg-error-container/30 px-4 py-2 border border-error/20">
            {error}
          </p>
        )}

        <button
          className="bg-primary text-on-primary px-6 py-3 text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
