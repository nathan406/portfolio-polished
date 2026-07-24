'use client';

import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_auth');
    if (stored === 'true') {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_key', password);
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center" style={{ padding: '2.5rem' }}>          <div className="w-full animate-fade-in-up" style={{ maxWidth: '620px' }}>
          <div className="bg-surface border border-accent-border text-center" style={{ padding: '4rem', borderRadius: '1.5rem' }}>
            {/* Lock icon */}
            <div className="mx-auto bg-accent-dim flex items-center justify-center" style={{ width: '6rem', height: '6rem', borderRadius: '9999px', marginBottom: '2.5rem' }}>
              <svg className="text-accent" viewBox="0 0 24 24" style={{ width: '3rem', height: '3rem' }} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h2 className="font-display font-bold text-text-primary tracking-tight" style={{ marginBottom: '1.25rem', fontSize: '2.25rem' }}>Admin Access</h2>
            <p className="text-text-muted" style={{ marginBottom: '3.5rem', fontSize: '1rem' }}>Enter password to manage your site</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-bg border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-all text-center"
                style={{ padding: '1.25rem 1.75rem', fontSize: '1rem', borderRadius: '1rem' }}
                autoFocus
              />

              {error && (
                <p className="text-xs text-accent/70">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-bg text-lg font-bold transition-all duration-300 active:scale-[0.97] shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/40"
                style={{ padding: '1rem 5rem', borderRadius: '9999px' }}
              >
                Unlock Dashboard
              </button>
            </form>
          </div>

          <p className="text-xs text-text-muted/50 text-center" style={{ marginTop: '2.5rem' }}>
            Protected area — only site admins can access
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
