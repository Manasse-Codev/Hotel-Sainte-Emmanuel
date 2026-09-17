import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardTab from './tabs/DashboardTab';
import ReservationsTab from './tabs/ReservationsTab';
import ProfileTab from './tabs/ProfileTab';
import PaymentsTab from './tabs/PaymentsTab';
import NotificationsTab from './tabs/NotificationsTab';
import ReviewsTab from './tabs/ReviewsTab';
import ActivityTab from './tabs/ActivityTab';
import SupportTab from './tabs/SupportTab';

const tabs = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
  { id: 'reservations', label: 'Mes Réservations', icon: 'book_online' },
  { id: 'profile', label: 'Mon Profil', icon: 'manage_accounts' },
  { id: 'payments', label: 'Paiements', icon: 'payments' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'reviews', label: 'Mes Avis', icon: 'rate_review' },
  { id: 'activity', label: 'Mon Activité', icon: 'history' },
  { id: 'support', label: 'Assistance', icon: 'support_agent' },
];

export default function ClientSpaceModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab user={user} />;
      case 'reservations': return <ReservationsTab onCloseClientSpace={onClose} />;
      case 'profile': return <ProfileTab />;
      case 'payments': return <PaymentsTab />;
      case 'notifications': return <NotificationsTab />;
      case 'reviews': return <ReviewsTab />;
      case 'activity': return <ActivityTab />;
      case 'support': return <SupportTab />;
      default: return null;
    }
  };

  const firstName = user.first_name || user.firstname || '';
  const lastName = user.last_name || user.lastname || '';
  const initial = (firstName[0] || user.email?.[0] || 'C').toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col animate-fade-in">
      {/* Header de l'espace client */}
      <header className="border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-surface-container-lowest">
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-8 bg-secondary" />
          <div>
            <div className="font-bodoni text-headline-sm text-primary">Espace Client</div>
            <div className="font-jakarta text-label-sm text-secondary tracking-widest uppercase">
              Hôtel Sainte Emmanuelle
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="w-9 h-9 bg-primary-container flex items-center justify-center font-jakarta text-label-md font-bold text-primary">
              {initial}
            </div>
            <div className="hidden md:block">
              <div className="font-jakarta text-body-sm font-semibold text-primary leading-tight">
                {firstName} {lastName}
              </div>
              <div className="font-jakarta text-label-sm text-on-surface-variant tracking-wider uppercase">
                {user.loyalty || 'Membre'}
              </div>
            </div>
          </div>

          <button
            className="flex items-center gap-1.5 border border-outline-variant/40 px-3 py-2 hover:bg-surface-container-high transition-colors font-jakarta text-label-sm uppercase tracking-wider text-primary"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
            <span className="hidden sm:inline">Déconnexion</span>
          </button>

          <button
            className="p-2 hover:bg-surface-container-high transition-colors text-on-surface-variant"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation */}
        <aside className="w-56 flex-shrink-0 border-r border-outline-variant/20 bg-surface-container-low flex flex-col hidden sm:flex">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{ fontSize: '18px' }}
                >
                  {tab.icon}
                </span>
                <span className="font-jakarta text-body-sm">{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-auto font-jakarta text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-secondary text-white' : 'bg-secondary-container text-on-secondary-container'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-outline-variant/30 flex overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-3 min-w-[64px] transition-colors ${
                activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'
              }`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{tab.icon}</span>
              <span className="font-jakarta" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
                {tab.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pb-20 sm:pb-8">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
