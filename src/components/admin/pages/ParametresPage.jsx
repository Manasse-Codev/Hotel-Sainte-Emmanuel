import { useEffect, useState } from 'react';
import { api } from '../../../services/api';

export default function ParametresPage() {
  const [settings, setSettings] = useState({
    hotel_name: 'Hôtel Sainte Emmanuelle',
    city: 'Soubré, Côte d\'Ivoire',
    region: 'Région de la Nawa',
    address: 'Quartier Nabouhi, non loin de l\'EPP Nabouhi',
    phone: '+225 07 07 12 34 56',
    whatsapp: '+225 05 05 98 76 54',
    email: 'contact@hotel-sainte-emmanuelle.ci',
    checkin_time: '14:00',
    checkout_time: '12:00',
    currency: 'FCFA',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.admin.getSettings();
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Erreur chargement paramètres:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    setSettings((s) => ({ ...s, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.admin.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      alert(err.message || 'Impossible d\'enregistrer les paramètres.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <span className="font-jakarta text-label-md uppercase tracking-widest text-secondary font-semibold">
            Configuration Générale
          </span>
          <h2 className="font-bodoni text-headline-lg text-primary mt-1">Paramètres Système</h2>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
            Informations de l'établissement, politique de séjour et coordonnées officielles.
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 shadow-xs">
          <h3 className="font-bodoni text-headline-sm mb-5 pb-3 border-b border-outline-variant/20">
            Informations de l'Établissement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Nom de l'hôtel
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                name="hotel_name"
                onChange={handleChange}
                value={settings.hotel_name || ''}
              />
            </div>
            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Ville & Pays
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                name="city"
                onChange={handleChange}
                value={settings.city || ''}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Adresse & Localisation
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                name="address"
                onChange={handleChange}
                value={settings.address || ''}
                placeholder="Ex: Quartier Nabouhi, non loin de l'EPP Nabouhi"
              />
            </div>
            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Téléphone Réception
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                name="phone"
                onChange={handleChange}
                value={settings.phone || ''}
              />
            </div>
            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                WhatsApp Conciergerie
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                name="whatsapp"
                onChange={handleChange}
                value={settings.whatsapp || ''}
              />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 shadow-xs">
          <h3 className="font-bodoni text-headline-sm mb-5 pb-3 border-b border-outline-variant/20">
            Horaires & Modalités de Séjour
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Heure de Check-in
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                name="checkin_time"
                onChange={handleChange}
                value={settings.checkin_time || ''}
              />
            </div>
            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Heure de Check-out
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                name="checkout_time"
                onChange={handleChange}
                value={settings.checkout_time || ''}
              />
            </div>
          </div>
        </div>

        {saved && (
          <p className="font-jakarta text-body-sm text-primary bg-surface-container px-4 py-2 border border-primary/20">
            ✓ Paramètres enregistrés avec succès dans SQLite.
          </p>
        )}

        <button
          className="bg-primary text-on-primary px-6 py-3 text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </form>
    </div>
  );
}
