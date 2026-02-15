import React, { useState, useEffect } from 'react';
import { api } from '../api';

interface User {
  name: string;
  role: string;
  serviceId?: number;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [serviceName, setServiceName] = useState('');

  useEffect(() => {
    if (user.serviceId) {
      api.services.list().then((list: Array<{ id: number; name: string }>) => {
        const s = list.find((x) => x.id === user.serviceId);
        setServiceName(s ? s.name : '');
      });
    } else {
      setServiceName(user.role === 'admin' ? 'All services' : '');
    }
  }, [user]);

  return (
    <header className="gradient-header shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/90 rounded-lg px-2 py-1">
            <img src="/care-id-logo.png" alt="CARE-ID" className="h-7" />
          </div>
          <div className="flex items-center gap-2">
            {/* Avatar placeholder */}
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="badge-role">
              {user.name} · {user.role}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {serviceName && (
            <span className="text-sm text-primary-foreground/80 bg-primary-foreground/10 px-3 py-1 rounded-full">
              {serviceName}
            </span>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-1.5 bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground rounded-xl text-sm font-medium transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
