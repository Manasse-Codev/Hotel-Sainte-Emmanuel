export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-12 py-12 max-w-7xl mx-auto gap-6">
        <div>
          <div className="font-bodoni text-headline-sm text-primary">Hôtel Sainte Emmanuelle</div>
          <div className="text-label-sm text-on-surface-variant/80 mt-1">
            Quartier Nabouhi, non loin de l'EPP Nabouhi · Soubré, Côte d'Ivoire
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 font-jakarta text-label-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>admin_panel_settings</span>
            Espace Administration
          </a>
          <div className="text-body-sm text-on-surface-variant text-center md:text-right">
            © 2025 Hôtel Sainte Emmanuelle. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}
