import React, { useState } from 'react';
import { useT } from '../i18n';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  loading: boolean;
  error: string;
}

/* Inline SVG icons */
const HeartPulseIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.5 12.572l-7.5 7.428l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
    <path d="M12 6v15" opacity="0.3" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function Login({ onLogin, loading, error }: LoginProps) {
  const { t, dir } = useT();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username.trim(), password);
  };

  return (
    <div className="min-h-screen gradient-login-bg flex items-center justify-center p-4 relative overflow-hidden" dir={dir}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white backdrop-blur-md mb-4 ring-1 ring-white/20 overflow-hidden shadow-lg">
            <img src="/care-id-icon.png" alt={t('login.logoAlt')} className="h-20 w-20 object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">CARE-ID</h1>
          <p className="text-sm text-white/50 font-medium tracking-wide">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl p-8 sm:p-10 ring-1 ring-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t('login.username')}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white
                    placeholder:text-white/25 focus:ring-2 focus:ring-primary/40 focus:border-primary/50
                    focus:outline-none transition-all duration-200"
                  placeholder={t('login.usernamePlaceholder')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <LockIcon />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white
                    placeholder:text-white/25 focus:ring-2 focus:ring-primary/40 focus:border-primary/50
                    focus:outline-none transition-all duration-200"
                  placeholder={t('login.passwordPlaceholder')}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-400/20 rounded-xl">
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl
                hover:brightness-110 disabled:opacity-50 transition-all duration-200
                focus:ring-2 focus:ring-primary/30 focus:outline-none
                shadow-lg shadow-primary/20 active:scale-[0.98] text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('login.signingIn')}
                </span>
              ) : (
                t('login.signIn')
              )}
            </button>
          </form>

          <p className="text-xs text-white/30 text-center mt-6 font-medium">
            {t('login.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
