export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-12 py-12 max-w-7xl mx-auto gap-6">
        <div className="font-bodoni text-headline-sm text-primary">Hôtel Sainte Emmanuelle</div>
        <div className="text-body-sm text-on-surface-variant text-center md:text-right">
          © 2025 Hôtel Sainte Emmanuelle. Soubré, Côte d'Ivoire. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
