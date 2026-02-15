import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useT, type Lang } from '../i18n';

interface User {
  name: string;
  role: string;
  serviceId?: number;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const LogOutIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

export default function Header({ user, onLogout }: HeaderProps) {
  const { t, lang, setLang } = useT();
  const [serviceName, setServiceName] = useState('');

  useEffect(() => {
    if (user.serviceId) {
      api.services.list().then((list: Array<{ id: number; name: string }>) => {
        const s = list.find((x) => x.id === user.serviceId);
        setServiceName(s ? s.name : '');
      });
    } else {
      setServiceName(user.role === 'admin' ? t('header.allServices') : '');
    }
  }, [user, t]);

  return (
    <header className="gradient-header shadow-lg shadow-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Logo + User */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center ring-1 ring-white/20 overflow-hidden shadow-sm">
              <img src="/care-id-icon.png" alt={t('header.logoAlt')} className="h-9 w-9 object-cover" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:inline">CARE-ID</span>
          </div>

          {/* Separator */}
          <div className="w-px h-7 bg-white/15 hidden sm:block" />

          {/* User info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-sm font-bold ring-1 ring-white/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white leading-tight">{user.name}</span>
              <span className="text-xs text-white/50 capitalize leading-tight">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Right: Lang Switcher + Service + Logout */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center bg-white/10 rounded-lg ring-1 ring-white/10 overflow-hidden">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
                  lang === l.code
                    ? 'bg-white text-primary'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {serviceName && (
            <span className="text-xs font-medium text-white/70 bg-white/10 px-3 py-1.5 rounded-lg ring-1 ring-white/10">
              {serviceName}
            </span>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all duration-200 ring-1 ring-white/10 active:scale-[0.97]"
          >
            <LogOutIcon />
            <span className="hidden sm:inline">{t('header.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
