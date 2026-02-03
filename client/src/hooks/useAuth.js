import { useState, useEffect } from 'react';

const API = '/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { user: null })
      .then(data => {
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = () => {
    window.location.href = `${API}/auth/google`;
  };

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    window.location.href = '/';
  };

  return { user, loading, login, logout };
}
