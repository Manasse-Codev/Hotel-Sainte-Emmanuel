import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onOpenAuth, onOpenClientSpace }) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#accueil', label: 'Accueil' },
    { href: '#chambres', label: 'Chambres' },
    { href: '#experience', label: 'Expérience' },
    { href: '#galerie', label: 'Galerie' },
    { href: '#offres', label: 'Offres' },
    { href: '#infos-pratiques', label: 'Infos & FAQ' },
    { href: '#contact', label: 'Contact' },
  ];

  const handleUserSpaceClick = () => {
    if (user) {
      onOpenClientSpace();
    } else {
      onOpenAuth('login');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface/95 backdrop-blur-md shadow-sm' : 'bg-surface/95 backdrop-blur-md'
      } border-b border-outline-variant/20`}
    >
      <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a
          className="font-bodoni text-headline-sm text-primary flex items-center gap-2 tracking-wide"
          href="#accueil"
        >
          Hôtel Sainte Emmanuelle
        </a>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="text-on-surface-variant hover:text-primary transition-colors text-label-md tracking-wider uppercase"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            className="hidden sm:inline-flex items-center gap-2 border border-outline-variant px-4 py-2 text-label-md tracking-widest uppercase hover:border-primary transition-colors"
            href="tel:+2250171626060"
          >
            <span className="material-symbols-outlined text-sm text-secondary" style={{ fontSize: '16px' }}>call</span>
            <span>+225 01 71 62 60 60</span>
          </a>

          <button
            className="hidden sm:inline-flex items-center gap-2 border border-primary px-4 py-2 text-label-md tracking-widest uppercase hover:bg-surface-container transition-colors"
            onClick={handleUserSpaceClick}
            type="button"
          >
            <span className="material-symbols-outlined text-sm text-secondary" style={{ fontSize: '16px' }}>account_circle</span>
            <span>{user ? (user.first_name || user.firstname || 'Mon Espace') : 'Mon Espace'}</span>
          </button>

          <a
            className="bg-primary text-on-primary px-5 py-2 text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            href="#reservation"
          >
            RÉSERVER
          </a>

          {/* Mobile menu toggle */}
          <button
            className="xl:hidden p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface border-t border-outline-variant/20 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="block text-on-surface-variant hover:text-primary transition-colors text-label-md tracking-wider uppercase py-2"
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-outline-variant/20">
            <a
              className="flex items-center gap-2 text-label-md tracking-widest uppercase text-on-surface-variant py-2"
              href="tel:+2250171626060"
            >
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>call</span>
              +225 01 71 62 60 60
            </a>
            <button
              className="flex items-center gap-2 text-label-md tracking-widest uppercase text-on-surface-variant py-2 w-full text-left"
              onClick={() => { handleUserSpaceClick(); setMobileMenuOpen(false); }}
              type="button"
            >
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>account_circle</span>
              {user ? (user.first_name || user.firstname || 'Mon Espace') : 'Mon Espace'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
