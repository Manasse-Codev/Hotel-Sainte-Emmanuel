import { useState, useEffect } from 'react';
import { api } from "../../../../services/api";

export default function NotificationsTab() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.notifications.getMy();
      setNotifs(data || []);
    } catch (err) {
      console.warn('Erreur notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await api.notifications.markRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await api.notifications.markAllRead();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <div>
          <h2 className="font-bodoni text-headline-sm">Notifications</h2>
          <span className="font-jakarta text-label-sm text-on-surface-variant">
            {unreadCount} non lue(s)
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            className="text-label-xs uppercase tracking-wider text-secondary hover:underline font-semibold"
            onClick={handleMarkAll}
            type="button"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="material-symbols-outlined animate-spin text-secondary" style={{ fontSize: '32px' }}>
            progress_activity
          </span>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">Chargement de vos alertes...</p>
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-outline-variant/40 p-8">
          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '36px' }}>
            notifications_off
          </span>
          <p className="font-bodoni text-headline-sm mt-3 text-on-surface-variant">Aucune notification</p>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-1">
            Les confirmations et informations relatives à vos séjours apparaîtront ici.
          </p>
        </div>
      ) : (
        notifs.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-4 p-4 border transition-colors cursor-pointer ${
              notif.is_read
                ? 'border-outline-variant/20 bg-surface'
                : 'border-secondary/40 bg-secondary-container/10'
            }`}
            onClick={() => handleMarkRead(notif.id)}
          >
            <span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontSize: '20px' }}>
              info
            </span>
            <div className="flex-1">
              <div className="font-jakarta text-body-sm font-semibold">{notif.title}</div>
              <div className="font-jakarta text-body-sm text-on-surface-variant mt-0.5">
                {notif.message}
              </div>
              <div className="font-jakarta text-label-xs text-on-surface-variant mt-1">
                {new Date(notif.created_at).toLocaleString('fr-FR')}
              </div>
            </div>
            {!notif.is_read && <span className="w-2.5 h-2.5 rounded-full bg-secondary mt-2 flex-shrink-0" />}
          </div>
        ))
      )}
    </div>
  );
}
