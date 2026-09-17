import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between items-center p-6 text-center select-none">
      {/* Header Brand */}
      <header className="pt-8">
        <Link to="/" className="inline-block">
          <span className="font-bodoni text-headline-sm text-primary tracking-widest block">
            HÔTEL SAINTE EMMANUELLE
          </span>
          <span className="font-jakarta text-label-xs text-secondary tracking-[0.3em] uppercase">
            Soubré · Côte d'Ivoire
          </span>
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="max-w-md my-auto py-12 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-high border border-outline-variant/40 mb-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '36px' }}>
            hotel_class
          </span>
        </div>

        <div className="space-y-2">
          <span className="font-bodoni text-display-sm text-secondary font-light block">
            404
          </span>
          <h1 className="font-bodoni text-headline-md text-primary font-normal">
            Page Introuvable
          </h1>
          <p className="font-jakarta text-body-md text-on-surface-variant font-light leading-relaxed">
            La page que vous recherchez semble s'être égarée. Nous vous invitons à regagner les allées de notre domaine.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 font-jakarta text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Retour à l'accueil
          </Link>
          <a
            href="tel:+2250171626060"
            className="w-full sm:w-auto border border-outline-variant px-6 py-3.5 font-jakarta text-label-md tracking-widest uppercase hover:bg-surface-container transition-colors text-primary flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>call</span>
            Conciergerie
          </a>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="pb-8 text-on-surface-variant font-jakarta text-label-sm">
        © {new Date().getFullYear()} Hôtel Sainte Emmanuelle — Quartier Nabouhi, Soubré.
      </footer>
    </div>
  );
}
