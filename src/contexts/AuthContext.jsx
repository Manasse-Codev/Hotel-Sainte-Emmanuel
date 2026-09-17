import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronize on mount if token is present
  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (token) {
        try {
          const me = await api.auth.getMe();
          setUser(me);
          localStorage.setItem('hse_user', JSON.stringify(me));
        } catch {
          setToken(null);
          setUser(null);
          localStorage.removeItem('hse_user');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = useCallback(async (emailOrUserData, maybePassword) => {
    // If called with email and password
    if (typeof emailOrUserData === 'string' && maybePassword) {
      const res = await api.auth.login(emailOrUserData, maybePassword);
      // Fetch full profile with stats
      const me = await api.auth.getMe();
      setUser(me);
      localStorage.setItem('hse_user', JSON.stringify(me));
      return me;
    }
    // Fallback: called with an object directly
    if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
      setUser(emailOrUserData);
      localStorage.setItem('hse_user', JSON.stringify(emailOrUserData));
      return emailOrUserData;
    }
  }, []);

  const register = useCallback(async (userData) => {
    await api.auth.register(userData);
    const me = await api.auth.getMe();
    setUser(me);
    localStorage.setItem('hse_user', JSON.stringify(me));
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network error on logout
    } finally {
      setUser(null);
      localStorage.removeItem('hse_user');
    }
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('hse_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin',
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
