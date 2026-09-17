import { useState } from 'react';

export default function SupportTab() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-bodoni text-headline-sm pb-4 border-b border-outline-variant/20">Assistance</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: 'call', label: 'Téléphone', value: '+225 01 71 62 60 60', note: 'Réception 24h/24' },
          { icon: 'email', label: 'E-mail', value: 'contact@hotel-sainte-emmanuelle.ci', note: 'Réponse sous 24h' },
          { icon: 'location_on', label: 'Adresse', value: 'Quartier Nabouhi, non loin de l\'EPP Nabouhi', note: 'Soubré, Région de la Nawa' },
        ].map((item) => (
          <div key={item.label} className="border border-outline-variant/30 p-4 text-center space-y-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>{item.icon}</span>
            <div className="font-bodoni text-headline-sm">{item.value}</div>
            <div className="font-jakarta text-label-sm text-on-surface-variant uppercase tracking-wider">{item.note}</div>
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '32px' }}>mark_email_read</span>
          <p className="font-bodoni text-headline-sm mt-3">Message envoyé !</p>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Notre équipe vous répondra dans les 24h.</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">Sujet</label>
            <input
              className="w-full border border-outline-variant/40 px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none"
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Objet de votre demande"
              required
              type="text"
              value={form.subject}
            />
          </div>
          <div>
            <label className="block font-jakarta text-label-sm tracking-widest uppercase text-on-surface-variant mb-2">Message</label>
            <textarea
              className="w-full border border-outline-variant/40 px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none resize-none"
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Décrivez votre demande..."
              required
              rows={5}
              value={form.message}
            />
          </div>
          <button
            className="bg-primary text-on-primary px-6 py-3 text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            type="submit"
          >
            Envoyer le message
          </button>
        </form>
      )}
    </div>
  );
}
