import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  loading: boolean;
  error: string;
}

export default function Login({ onLogin, loading, error }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username.trim(), password);
  };

  return (
    <div className="min-h-screen gradient-login-bg flex items-center justify-center p-4">
      {/* Decorative subtle pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="relative bg-card rounded-2xl shadow-modal p-8 sm:p-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <img src="/care-id-logo.png" alt="CARE-ID" className="h-14 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Patient Preference & Priority Engine
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="label-field">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-danger-muted rounded-xl border border-destructive/20">
              <p className="text-sm text-danger-muted-foreground font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Sign in with your staff credentials
        </p>
      </div>
    </div>
  );
}
