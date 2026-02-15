import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import Login from './components/Login';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import NurseDashboard from './components/NurseDashboard';
import DoctorDashboard from './components/DoctorDashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('c4c_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (username, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.login(username, password);
      setUser(data.user);
      sessionStorage.setItem('c4c_user', JSON.stringify(data.user));
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('c4c_user');
  }, []);

  if (!user) {
    return <Login onLogin={login} loading={loading} error={error} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={logout} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'nurse' && <NurseDashboard user={user} />}
        {user.role === 'doctor' && <DoctorDashboard user={user} />}
      </main>
    </div>
  );
}
