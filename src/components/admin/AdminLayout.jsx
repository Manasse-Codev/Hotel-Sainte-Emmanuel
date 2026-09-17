import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import DashboardPage from './pages/DashboardPage';
import ReservationsPage from './pages/ReservationsPage';
import ChambresPage from './pages/ChambresPage';
import ClientsPage from './pages/ClientsPage';
import PaiementsPage from './pages/PaiementsPage';
import AvisPage from './pages/AvisPage';
import JournalPage from './pages/JournalPage';
import StatistiquesPage from './pages/StatistiquesPage';
import ParametresPage from './pages/ParametresPage';

const navGroups = [
  {
    label: 'Exploitation Hôtelière',
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
      { id: 'reservations', label: 'Réservations & Arrivées', icon: 'book_online' },
      { id: 'chambres', label: 'Chambres & Entretien', icon: 'bedroom_parent' },
      { id: 'clients', label: 'Répertoire Clients', icon: 'contacts' },
      { id: 'paiements', label: 'Paiements & Encaissements', icon: 'account_balance_wallet' },
    ],
  },
  {
    label: 'Gouvernance & Contrôle',
    items: [
      { id: 'avis', label: 'Modération des Avis', icon: 'rate_review' },
      { id: 'journal', label: 'Journal & Audit', icon: 'receipt_long' },
      { id: 'statistiques', label: 'Statistiques & Revenus', icon: 'analytics' },
      { id: 'parametres', label: 'Paramètres Système', icon: 'settings_suggest' },
    ],
  },
];

export default function AdminLayout() {
  const { user, login, logout, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [rooms, setRooms] = useState([]);

  // Admin login form state for unauthenticated users
  const [loginForm, setLoginForm] = useState({
    email: 'admin@hotel-sainte-emmanuelle.ci',
    password: 'admin1234',
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Booking modal form state
  const [bookingForm, setBookingForm] = useState({
    guest_name: '',
    phone: '',
    room_id: 'standard',
    check_in: new Date().toISOString().split('T')[0],
    check_out: '',
    guests: 1,
    special_requests: '',
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      api.admin.getKpis().then(setKpis).catch(() => {});
      api.admin.getRooms().then(setRooms).catch(() => {});
    }
  }, [isAdmin, activePage]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const loggedUser = await login(loginForm.email, loginForm.password);
      if (loggedUser.role !== 'admin') {
        throw new Error('Ce compte ne possède pas les privilèges administrateur.');
      }
    } catch (err) {
      setLoginError(err.message || 'Identifiants incorrects.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.guest_name || !bookingForm.phone || !bookingForm.check_in || !bookingForm.check_out) {
      setBookingError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setBookingSubmitting(true);
    setBookingError('');
    try {
      await api.admin.createReservation(bookingForm);
      setShowNewBookingModal(false);
      setBookingForm({
        guest_name: '',
        phone: '',
        room_id: rooms[0]?.id || 'standard',
        check_in: new Date().toISOString().split('T')[0],
        check_out: '',
        guests: 1,
        special_requests: '',
      });
      // Refresh
      const updatedKpis = await api.admin.getKpis().catch(() => null);
      if (updatedKpis) setKpis(updatedKpis);
      setActivePage('reservations');
    } catch (err) {
      setBookingError(err.message || 'Impossible d\'enregistrer la réservation.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // If not logged in as admin, show secure login barrier
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-on-background font-jakarta flex items-center justify-center p-4">
        <div className="bg-surface w-full max-w-md border border-outline-variant/30 shadow-2xl p-8 relative">
          <div className="h-[2px] bg-secondary absolute top-0 left-0 right-0" />
          <div className="text-center mb-8">
            <span className="font-jakarta text-label-sm uppercase tracking-widest text-secondary font-semibold block mb-1">
              Portail Sécurisé
            </span>
            <h1 className="font-bodoni text-headline-md text-primary">Direction & Réception</h1>
            <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">
              Hôtel Sainte Emmanuelle — Soubré
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Identifiant Administrateur
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none"
                onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                required
                type="email"
                value={loginForm.email}
              />
            </div>

            <div>
              <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Mot de Passe Sécurisé
              </label>
              <input
                className="w-full border border-outline-variant/40 bg-surface px-4 py-3 font-jakarta text-body-sm focus:border-primary focus:outline-none"
                onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                required
                type="password"
                value={loginForm.password}
              />
            </div>

            {loginError && (
              <p className="font-jakarta text-body-sm text-error bg-error-container/30 px-3 py-2 border border-error/20">
                {loginError}
              </p>
            )}

            <button
              className="w-full bg-primary text-on-primary py-3.5 font-jakarta text-label-md uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50"
              disabled={loginLoading}
              type="submit"
            >
              {loginLoading ? 'Connexion en cours...' : 'Accéder au Portail'}
            </button>

            <div className="pt-4 text-center">
              <a
                className="font-jakarta text-body-sm text-secondary hover:underline flex items-center justify-center gap-1"
                href="/"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                Retour au site public
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNewBooking={() => setShowNewBookingModal(true)} />;
      case 'reservations': return <ReservationsPage />;
      case 'chambres': return <ChambresPage />;
      case 'clients': return <ClientsPage />;
      case 'paiements': return <PaiementsPage />;
      case 'avis': return <AvisPage />;
      case 'journal': return <JournalPage />;
      case 'statistiques': return <StatistiquesPage />;
      case 'parametres': return <ParametresPage />;
      default: return <DashboardPage onNewBooking={() => setShowNewBookingModal(true)} />;
    }
  };

  const occupancyRate = kpis ? kpis.occupancy_rate : 83;

  return (
    <div className="h-screen bg-background text-on-background font-jakarta text-body-md antialiased flex flex-col overflow-hidden">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant/30 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Status */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-1.5 text-on-surface-variant hover:text-primary"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="border-l-2 border-primary pl-3">
            <h1 className="font-bodoni text-headline-sm tracking-wide text-primary">HÔTEL SAINTE EMMANUELLE</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-jakarta text-label-sm tracking-widest text-secondary font-semibold uppercase">
                Portail de Gestion & Conciergerie
              </span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5 font-jakarta text-label-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-emerald-600 status-pulse" />
                Base SQLite Active
              </span>
            </div>
          </div>
        </div>

        {/* Métriques temps réel */}
        <div className="hidden xl:flex items-center gap-6 border border-outline-variant/20 bg-surface-container-low px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>calendar_today</span>
            <div>
              <span className="font-jakarta text-label-sm text-on-surface-variant block uppercase">Date du Jour</span>
              <span className="font-jakarta text-body-sm font-semibold text-primary">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-outline-variant/40" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>hotel</span>
            <div>
              <span className="font-jakarta text-label-sm text-on-surface-variant block uppercase">Taux d'Occupation</span>
              <span className="font-jakarta text-body-sm font-semibold text-primary">
                {occupancyRate}% <span className="font-normal text-on-surface-variant">({kpis ? kpis.occupied_rooms : 2} / {kpis ? kpis.total_rooms : 3} Chambres)</span>
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-outline-variant/40" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '18px' }}>cell_tower</span>
            <div>
              <span className="font-jakarta text-label-sm text-on-surface-variant block uppercase">Passerelles Actives</span>
              <span className="font-jakarta text-body-sm font-semibold text-primary flex items-center gap-1.5">
                Wave <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Orange Money <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </span>
            </div>
          </div>
        </div>

        {/* Profil & actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/30">
            <div className="w-9 h-9 bg-primary text-on-primary flex items-center justify-center font-jakarta text-label-md font-bold">
              {user?.first_name ? user.first_name[0] : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-jakarta text-body-sm font-bold text-primary leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <span className="font-jakarta text-label-sm text-on-surface-variant tracking-wider uppercase">Direction Générale</span>
            </div>
          </div>
          <a
            className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container-highest transition-colors font-jakarta text-label-sm uppercase font-semibold text-primary"
            href="/"
            title="Revenir au site vitrine"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
            <span className="hidden md:inline">Site Public</span>
          </a>
          <button
            className="flex items-center gap-1.5 px-3 py-2 border border-error/30 text-error hover:bg-error-container/20 transition-colors font-jakarta text-label-sm uppercase font-semibold"
            onClick={logout}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-64 bg-surface-container-low border-b lg:border-b-0 lg:border-r border-outline-variant/20 flex-shrink-0 flex-col justify-between absolute lg:relative z-30 h-full lg:h-auto`}>
          <div className="p-4 lg:p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.label}>
                <span className="font-jakarta text-label-sm text-on-surface-variant font-bold uppercase tracking-wider block mb-3 px-2">
                  {group.label}
                </span>
                <nav className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all font-jakarta text-body-sm ${
                        activePage === item.id
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                      }`}
                      onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                      type="button"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-outline-variant/20 bg-surface-container/60 hidden lg:block">
            <div className="flex items-center justify-between text-on-surface-variant font-jakarta text-label-sm mb-1">
              <span>HSE Core Server</span>
              <span className="text-emerald-700 font-semibold">FastAPI + SQLite</span>
            </div>
            <div className="font-jakarta text-label-sm text-on-surface-variant truncate">Port 8000 · Soubré, Nawa</div>
          </div>
        </aside>

        {/* Overlay mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8 bg-surface">
          {renderPage()}
        </main>
      </div>

      {/* Nouvelle Attribution Modal */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface w-full max-w-md shadow-xl animate-slide-up">
            <div className="h-[2px] bg-secondary" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bodoni text-headline-sm">Nouvelle Attribution Réception</h2>
                <button className="p-1 hover:bg-surface-container transition-colors" onClick={() => setShowNewBookingModal(false)} type="button">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>
              <form className="space-y-4" onSubmit={handleCreateBooking}>
                <div>
                  <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Nom du client *
                  </label>
                  <input
                    className="w-full border border-outline-variant/40 px-3 py-2 font-jakarta text-body-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setBookingForm((f) => ({ ...f, guest_name: e.target.value }))}
                    placeholder="M. Yao Kobenan"
                    required
                    type="text"
                    value={bookingForm.guest_name}
                  />
                </div>

                <div>
                  <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Téléphone *
                  </label>
                  <input
                    className="w-full border border-outline-variant/40 px-3 py-2 font-jakarta text-body-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setBookingForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+225 xx xx xx xx"
                    required
                    type="tel"
                    value={bookingForm.phone}
                  />
                </div>

                <div>
                  <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Chambre assignée *
                  </label>
                  <select
                    className="w-full border border-outline-variant/40 px-3 py-2 font-jakarta text-body-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setBookingForm((f) => ({ ...f, room_id: e.target.value }))}
                    value={bookingForm.room_id}
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.price_display}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                      Arrivée *
                    </label>
                    <input
                      className="w-full border border-outline-variant/40 px-3 py-2 font-jakarta text-body-sm focus:border-primary focus:outline-none"
                      onChange={(e) => setBookingForm((f) => ({ ...f, check_in: e.target.value }))}
                      required
                      type="date"
                      value={bookingForm.check_in}
                    />
                  </div>
                  <div>
                    <label className="block font-jakarta text-label-xs uppercase tracking-wider text-on-surface-variant mb-1">
                      Départ *
                    </label>
                    <input
                      className="w-full border border-outline-variant/40 px-3 py-2 font-jakarta text-body-sm focus:border-primary focus:outline-none"
                      min={bookingForm.check_in}
                      onChange={(e) => setBookingForm((f) => ({ ...f, check_out: e.target.value }))}
                      required
                      type="date"
                      value={bookingForm.check_out}
                    />
                  </div>
                </div>

                {bookingError && (
                  <p className="font-jakarta text-body-sm text-error bg-error-container/30 p-2">
                    {bookingError}
                  </p>
                )}

                <button
                  className="w-full bg-primary text-on-primary py-3 font-jakarta text-label-md tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  disabled={bookingSubmitting}
                  type="submit"
                >
                  {bookingSubmitting ? 'Validation...' : 'Confirmer l\'Attribution'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
