import React, { useState, useCallback } from 'react';
import { api } from './api';
import { LanguageProvider, useT } from './i18n';
import Login from './components/Login';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import NurseDashboard from './components/NurseDashboard';
import DoctorDashboard from './components/DoctorDashboard';

function AppInner() {
  const { t, dir } = useT();
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('c4c_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (username: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.login(username, password);
      setUser(data.user);
      sessionStorage.setItem('c4c_user', JSON.stringify(data.user));
    } catch (e: any) {
      setError(e.message || t('login.failed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('c4c_user');
  }, []);

  if (!user) {
    return <Login onLogin={login} loading={loading} error={error} />;
  }

  return (
    <div className="min-h-screen bg-background relative" dir={dir}>
      {/* Subtle background pattern */}
      <div className="fixed inset-0 dot-pattern opacity-40 pointer-events-none" />
      <div className="relative">
        <Header user={user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'nurse' && <NurseDashboard user={user} />}
          {user.role === 'doctor' && <DoctorDashboard user={user} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
