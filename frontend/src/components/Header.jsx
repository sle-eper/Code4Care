import React, { useState } from 'react';
import { api } from '../api';

export default function Header({ user, onLogout }) {
  const [serviceName, setServiceName] = useState('');

  React.useEffect(() => {
    if (user.serviceId) {
      api.services.list().then((list) => {
        const s = list.find((x) => x.id === user.serviceId);
        setServiceName(s ? s.name : '');
      });
    } else {
      setServiceName(user.role === 'admin' ? 'All services' : '');
    }
  }, [user]);

  return (
    <header className="gradient-header text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Code4Care</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/20">
            {user.name} ({user.role})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-90">{serviceName}</span>
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
