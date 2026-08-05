'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';
import { AuthGate, LogoutButton } from '@/components/AuthGate';
import { DatePicker } from '@/components/DatePicker';
import { STRONG_PASSWORD_RE, STRONG_PASSWORD_HINT } from '@/lib/password';
import type { Project, Technology, Skill, SocialLink } from '@/lib/types';

/* ── Types ── */

type DashboardTab = 'projects' | 'about' | 'technologies' | 'skills' | 'socials' | 'resume' | 'settings';

const NAV_ITEMS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'about', label: 'About', icon: 'info' },
  { id: 'technologies', label: 'Technologies', icon: 'code' },
  { id: 'skills', label: 'Skills', icon: 'star' },
  { id: 'socials', label: 'Social Links', icon: 'link' },
  { id: 'resume', label: 'Resume', icon: 'file' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

/* ── Icons ── */

function NavIcon({ type, className = "w-5 h-5" }: { type: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    folder: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    info: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    code: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    link: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    file: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    settings: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    plus: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    edit: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    close: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    external: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
    check: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    star: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  };
  return icons[type] || null;
}

/* ── Admin Layout ── */

function AdminLayout({ activeTab, onTabChange, children }: { activeTab: DashboardTab; onTabChange: (tab: DashboardTab) => void; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #0D0D0D 50%, #0A0A0A 100%)' }}>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] flex-shrink-0
        bg-[#0C0C0C] border-r border-border/50
        transition-transform duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6" style={{ height: '88px', borderBottom: '1px solid rgba(30, 30, 30, 0.6)' }}>
            <div className="flex items-center gap-3.5">
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #DC2626, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)', flexShrink: 0 }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0A0A0A' }}>N</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-text-primary tracking-tight" style={{ fontSize: '17px', lineHeight: 1.2 }}>Dashboard</h1>
                <p className="text-text-muted/60" style={{ fontSize: '11px', marginTop: '2px' }}>Portfolio Admin</p>
              </div>
            </div>
            <button className="lg:hidden p-2 hover:bg-surface-elevated transition-all" style={{ borderRadius: '10px' }} onClick={() => setMobileOpen(false)}>
              <NavIcon type="close" className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto" style={{ padding: '28px 16px' }}>
            <p className="text-text-muted/40 font-mono-custom" style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 16px 24px 16px' }}>Management</p>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                      background: isActive ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), transparent)' : 'transparent',
                      color: isActive ? '#DC2626' : 'rgba(113, 113, 122, 0.8)',
                      ...(isActive ? { borderColor: 'rgba(220, 38, 38, 0.2)' } : {}),
                    }}
                    className={!isActive ? 'hover:text-text-primary hover:bg-surface-elevated/60' : ''}
                  >
                    <div style={{
                      padding: '8px',
                      borderRadius: '10px',
                      transition: 'all 0.2s',
                      background: isActive ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <NavIcon type={item.icon} className={`w-[18px] h-[18px]`} />
                    </div>
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                    {isActive && (
                      <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626', boxShadow: '0 0 8px rgba(220, 38, 38, 0.5)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Bottom */}
          <div style={{ borderTop: '1px solid rgba(30, 30, 30, 0.6)', padding: '20px 16px' }}>
            <a
              href="/"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                color: 'rgba(113, 113, 122, 0.8)',
                transition: 'all 0.2s',
              }}
              className="hover:text-text-primary hover:bg-surface-elevated/60"
            >
              <NavIcon type="external" className="w-[18px] h-[18px] group-hover:text-accent" />
              <span>View Public Site</span>
            </a>
            <div style={{ padding: '6px 16px' }}>
              <LogoutButton className="text-text-muted/80 hover:text-[#DC2626] text-sm transition-all duration-200" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0" style={{ minHeight: '100vh' }}>
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 h-16 sticky top-0 z-30" style={{ borderBottom: '1px solid rgba(30, 30, 30, 0.6)', background: '#141414' }}>
          <button onClick={() => setMobileOpen(true)} className="p-2.5 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px' }}>
            <svg className="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #DC2626, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A0A0A' }}>N</span>
            </div>
            <span className="font-display text-sm font-bold text-text-primary">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>

        {/* Content */}
        <div style={{ padding: '48px 40px 48px 40px', maxWidth: '1320px' }} className="xl:px-16">
          {children}
        </div>
      </main>
    </div>
  );
}

/* ── Shared Components ── */

function Message({ msg, onClose }: { msg: { type: 'success' | 'error'; text: string } | null; onClose: () => void }) {
  if (!msg) return null;
  const isSuccess = msg.type === 'success';
  return (
    <div className="animate-slide-down flex items-center justify-between" style={{
      marginBottom: '32px',
      padding: '18px 24px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: 500,
      background: isSuccess ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
      color: isSuccess ? '#4ade80' : '#fca5a5',
      border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
      boxShadow: isSuccess ? '0 4px 20px rgba(34, 197, 94, 0.08)' : '0 4px 20px rgba(239, 68, 68, 0.08)',
    }}>
      <div className="flex items-center gap-3">
        <div style={{
          padding: '6px',
          borderRadius: '8px',
          background: isSuccess ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
        }}>
          <NavIcon type={isSuccess ? 'check' : 'close'} className="w-4 h-4" />
        </div>
        <span>{msg.text}</span>
      </div>
      <button onClick={onClose} className="p-1.5 hover:bg-white/5 transition-colors" style={{ borderRadius: '50%' }}>
        <NavIcon type="close" className="w-4 h-4" />
      </button>
    </div>
  );
}

function Input({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '10px', letterSpacing: '0.02em' }}>{label}</label>
      <input
        {...props}
        style={{ padding: '1.25rem 1.75rem', fontSize: '15px', borderRadius: '1rem', colorScheme: 'dark' }}
        className={`w-full bg-bg border text-text-primary placeholder-text-muted/40 focus:outline-none transition-all duration-200 ${error ? 'border-red-500/70' : 'border-border hover:border-text-muted/30 focus:border-accent'}`}
      />
      {error && (
        <p className="text-xs mt-2 flex items-center gap-1.5 animate-fade-in" style={{ color: '#fca5a5' }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

function TextArea({ label, error, ...props }: { label?: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '10px', letterSpacing: '0.02em' }}>{label}</label>}
      <textarea
        {...props}
        style={{ padding: '1.25rem 1.75rem', fontSize: '15px', borderRadius: '1rem' }}
        className={`w-full bg-bg border text-text-primary placeholder-text-muted/40 focus:outline-none transition-all duration-200 resize-none ${error ? 'border-red-500/70' : 'border-border hover:border-text-muted/30 focus:border-accent'}`}
      />
      {error && (
        <p className="text-xs mt-2 flex items-center gap-1.5 animate-fade-in" style={{ color: '#fca5a5' }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(16px)', padding: '24px' }}>
      <div className="w-full animate-fade-in-up" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.15)', borderRadius: '1.5rem', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)' }}>
        <div className="flex items-center justify-between" style={{ padding: '24px 40px', borderBottom: '1px solid rgba(30, 30, 30, 0.6)' }}>
          <h2 className="font-display font-bold text-text-primary tracking-tight" style={{ fontSize: '24px' }}>{title}</h2>
          <button onClick={onClose} className="p-2.5 hover:bg-surface-elevated transition-all duration-200 hover:scale-105" style={{ borderRadius: '10px' }}>
            <NavIcon type="close" className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        <div style={{ padding: '32px 40px' }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(16px)', padding: '24px' }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full animate-fade-in-up" style={{ maxWidth: '440px', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.15)', borderRadius: '1.5rem', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)' }}>
        <div style={{ padding: '36px 40px', textAlign: 'center' }}>
          <div
            className="mx-auto flex items-center justify-center"
            style={{ width: '72px', height: '72px', borderRadius: '9999px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.25)', marginBottom: '28px' }}
          >
            <NavIcon type="trash" className="w-8 h-8 text-[#DC2626]" />
          </div>
          <h3 className="font-display font-bold text-text-primary tracking-tight" style={{ fontSize: '22px', marginBottom: '12px' }}>{title}</h3>
          <p className="text-text-muted" style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '36px' }}>{message}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1"
              style={{ padding: '14px 24px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, background: '#1A1A1A', color: 'rgba(113, 113, 122, 0.9)', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#222222'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1"
              style={{ padding: '14px 24px', borderRadius: '9999px', fontSize: '14px', fontWeight: 700, background: 'linear-gradient(135deg, #DC2626, #EF4444)', color: '#0A0A0A', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)', transition: 'all 0.2s ease' }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6" style={{ marginBottom: '48px' }}>
      <div>
        <div className="flex items-center gap-4" style={{ marginBottom: '8px' }}>
          <div style={{ width: '8px', height: '36px', background: '#DC2626', borderRadius: '4px' }} />
          <h2 className="font-display font-bold text-text-primary tracking-tight sm:text-[32px]" style={{ fontSize: '28px' }}>{title}</h2>
        </div>
        {subtitle && <p className="text-text-muted" style={{ fontSize: '15px', marginLeft: '48px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Timeframe helpers ── */

// Normalizes legacy timeframe strings ("2024", "2024-06") into a value a
// date input can display. Returns '' for non-date values (e.g. "Present").
function toDateValue(v: string): string {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^\d{4}-\d{2}$/.test(v)) return v + '-01';
  if (/^\d{4}$/.test(v)) return v + '-01-01';
  return '';
}

// True when a timeframe_end value means "no end date" (e.g. "Present").
function isOngoingValue(v: string): boolean {
  return !!v && /^(present|ongoing|current)$/i.test(v.trim());
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '1rem 5rem',
        borderRadius: '9999px',
        fontSize: '15px',
        fontWeight: 700,
        background: disabled ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
        color: '#0A0A0A',
        boxShadow: disabled ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        transform: 'scale(1)',
        border: 'none',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; e.currentTarget.style.transform = 'scale(1.02)'; }}}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(1.02)'; }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 28px',
        borderRadius: '9999px',
        fontSize: '13px',
        fontWeight: 500,
        background: '#1A1A1A',
        color: 'rgba(113, 113, 122, 0.8)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid transparent',
      }}
      className="hover:bg-[#1E1E1E] hover:text-text-primary active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

/* ── File Upload Component ── */

function FileUpload({ label, accept, value, onChange, maxSize = 10 }: {
  label: string;
  accept: string;
  value: string;
  onChange: (url: string) => void;
  maxSize?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getKey = () => sessionStorage.getItem('admin_key') || '';

  const uploadFile = async (file: File) => {
    setError(null);

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-key': getKey() },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (e.target) e.target.value = '';
  };

  const isImage = accept.includes('image');
  const isVideo = accept.includes('video');
  const isPdf = accept.includes('pdf');

  return (
    <div>
      <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '10px', letterSpacing: '0.02em' }}>{label}</label>

      {value ? (
        <div style={{ padding: '20px', background: '#1A1A1A', borderRadius: '1rem', border: '1px solid rgba(220, 38, 38, 0.15)' }}>
          {isImage && (
            <div className="relative group">
              <img src={value} alt="" className="w-full aspect-video object-cover" style={{ borderRadius: '0.75rem' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          {isVideo && value && (
            <div className="relative">
              <video src={value} controls className="w-full rounded-xl" style={{ maxHeight: '320px' }}>
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {isPdf && (
            <div className="flex items-center gap-4" style={{ padding: '16px 20px', background: '#141414', borderRadius: '0.75rem', border: '1px solid rgba(30, 30, 30, 0.6)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">Resume PDF</p>
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-accent/70 hover:text-accent transition-colors">View file →</a>
              </div>
              <button
                onClick={() => onChange('')}
                className="p-2 hover:bg-surface-elevated transition-all hover:scale-105"
                style={{ borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                title="Remove"
              >
                <NavIcon type="trash" className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(30, 30, 30, 0.5)' }}>
            <span className="text-xs text-text-muted/50 truncate" style={{ maxWidth: '200px' }}>{value.split('/').pop()}</span>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}
              >
                Replace
              </button>
              <button
                onClick={() => onChange('')}
                className="text-xs font-medium text-text-muted/50 hover:text-accent transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'rgba(220, 38, 38, 0.5)' : 'rgba(30, 30, 30, 0.8)'}`,
            borderRadius: '1rem',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: dragOver ? 'rgba(220, 38, 38, 0.03)' : 'transparent',
          }}
          className="hover:border-accent/30 hover:bg-accent/[0.02] group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin" style={{ width: '36px', height: '36px', border: '2px solid #DC2626', borderTopColor: 'transparent', borderRadius: '50%' }} />
              <span className="text-sm text-text-muted">Uploading...</span>
            </div>
          ) : (
            <>
              <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="group-hover:bg-accent/10 transition-colors">
                <svg className="w-6 h-6 text-text-muted/40 group-hover:text-accent/60 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-text-muted group-hover:text-text-primary transition-colors" style={{ marginBottom: '4px' }}>
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-text-muted/40">
                {isImage ? 'PNG, JPG, WebP, GIF' : isVideo ? 'MP4, WebM' : isPdf ? 'PDF' : 'Any file'} — up to {maxSize}MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs mt-2" style={{ color: '#fca5a5' }}>{error}</p>
      )}
    </div>
  );
}

/* ── Section: Projects ── */

function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({ title: '', description: '', image_url: '', project_url: '', video_url: '', timeframe_start: '', timeframe_end: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ongoing, setOngoing] = useState(false);
  const [allTechs, setAllTechs] = useState<Technology[]>([]);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [newTechs, setNewTechs] = useState<{ name: string; category: string }[]>([]);
  const [newTechName, setNewTechName] = useState('');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [newSkills, setNewSkills] = useState<{ name: string; category: string }[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<Project | null>(null);

  const load = useCallback(async () => {
    try {
      const [pr, tr, sr] = await Promise.all([fetch('/api/projects'), fetch('/api/technologies'), fetch('/api/skills')]);
      const d = await pr.json(); setProjects(Array.isArray(d) ? d : []);
      const t = await tr.json(); setAllTechs(Array.isArray(t) ? t : []);
      const s = await sr.json(); setAllSkills(Array.isArray(s) ? s : []);
    }
    catch { setMsg({ type: 'error', text: 'Failed to load projects' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm({ title: '', description: '', image_url: '', project_url: '', video_url: '', timeframe_start: '', timeframe_end: '' }); setErrors({}); setOngoing(false); setSelectedTechIds([]); setNewTechs([]); setNewTechName(''); setSelectedSkillIds([]); setNewSkills([]); setNewSkillName(''); setEditing(null); setShowForm(false); };

  const addNewTech = () => {
    const name = newTechName.trim();
    if (!name) return;
    const exists = [...newTechs.map(t => t.name), ...allTechs.map(t => t.name)]
      .some(n => n.toLowerCase() === name.toLowerCase());
    if (!exists) setNewTechs([...newTechs, { name, category: '' }]);
    setNewTechName('');
  };

  const addNewSkill = () => {
    const name = newSkillName.trim();
    if (!name) return;
    const exists = [...newSkills.map(s => s.name), ...allSkills.map(s => s.name)]
      .some(n => n.toLowerCase() === name.toLowerCase());
    if (!exists) setNewSkills([...newSkills, { name, category: '' }]);
    setNewSkillName('');
  };

  const openEdit = (p: Project) => {
    setForm({ title: p.title, description: p.description, image_url: p.image_url, project_url: p.project_url, video_url: p.video_url, timeframe_start: p.timeframe_start, timeframe_end: p.timeframe_end });
    setErrors({}); setOngoing(isOngoingValue(p.timeframe_end)); setSelectedTechIds((p.technologies || []).map(t => t.id)); setNewTechs([]); setNewTechName(''); setSelectedSkillIds((p.skills || []).map(s => s.id)); setNewSkills([]); setNewSkillName(''); setEditing(p); setShowForm(true);
  };

  const getKey = () => sessionStorage.getItem('admin_key') || '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Project title is required';
    if (form.project_url.trim() && !/^https?:\/\//i.test(form.project_url.trim())) newErrors.project_url = 'Enter a valid URL starting with http:// or https://';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMsg({ type: 'error', text: 'Please fix the required field(s) highlighted below.' });
      return;
    }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = {
        ...form,
        ...(editing ? { id: editing.id } : {}),
        technology_ids: selectedTechIds,
        new_technologies: newTechName.trim() ? [...newTechs, { name: newTechName.trim(), category: '' }] : newTechs,
        skill_ids: selectedSkillIds,
        new_skills: newSkillName.trim() ? [...newSkills, { name: newSkillName.trim(), category: '' }] : newSkills,
      };
      const r = await fetch('/api/projects', { method, headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error || 'Failed');
      setMsg({ type: 'success', text: editing ? 'Project updated!' : 'Project created!' });
      reset(); load();
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  const del = async (p: Project) => {
    // Optimistically remove from local state so it disappears instantly
    setProjects(prev => prev.filter(x => x.id !== p.id));
    try {
      const r = await fetch(`/api/projects?id=${p.id}`, { method: 'DELETE', headers: { 'x-admin-key': getKey() } });
      if (!r.ok) throw new Error('Failed');
      setMsg({ type: 'success', text: 'Project deleted!' });
    } catch {
      // Restore the item if the server call failed
      setProjects(prev => (prev.some(x => x.id === p.id) ? prev : [p, ...prev]));
      setMsg({ type: 'error', text: 'Failed to delete project' });
    }
  };

  return (
    <div>
      <SectionHeader
        title="Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} total`}
        action={<PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Project</PrimaryButton>}
      />

      <Message msg={msg} onClose={() => setMsg(null)} />

      {showForm && (
        <Modal title={editing ? 'Edit Project' : 'New Project'} onClose={reset}>
          <form onSubmit={submit} noValidate className="flex flex-col" style={{ gap: '32px' }}>
            <Input label="Project Title *" type="text" value={form.title} error={errors.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }} placeholder="My Amazing Project" required />
            <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your project..." rows={5} />
            <FileUpload label="Thumbnail Image" accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
            <Input label="Project URL" type="url" value={form.project_url} error={errors.project_url} onChange={(e) => { setForm({ ...form, project_url: e.target.value }); if (errors.project_url) setErrors({ ...errors, project_url: '' }); }} placeholder="https://myproject.com" />
            <FileUpload label="Project Video (optional)" accept="video/mp4,video/webm,.mp4,.webm" value={form.video_url} onChange={(url) => setForm({ ...form, video_url: url })} />

            {/* Technologies Used */}
            <div>
              <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '12px', letterSpacing: '0.02em' }}>Technologies Used</label>

              {allTechs.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginBottom: '16px' }}>
                  {allTechs.map(t => {
                    const selected = selectedTechIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTechIds(selected ? selectedTechIds.filter(id => id !== t.id) : [...selectedTechIds, t.id])}
                        style={{
                          padding: '10px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: `1px solid ${selected ? 'rgba(220, 38, 38, 0.45)' : '#1E1E1E'}`,
                          background: selected ? 'rgba(220, 38, 38, 0.12)' : '#0A0A0A',
                          color: selected ? '#fca5a5' : 'rgba(113, 113, 122, 0.8)',
                        }}
                        className={selected ? '' : 'hover:border-text-muted/40 hover:text-text-primary'}
                      >
                        {selected ? `${t.name} ✕` : t.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {newTechs.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginBottom: '16px' }}>
                  {newTechs.map((nt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewTechs(newTechs.filter((_, j) => j !== i))}
                      style={{ padding: '10px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', border: '1px dashed rgba(220, 38, 38, 0.5)', background: 'rgba(220, 38, 38, 0.08)', color: '#fca5a5' }}
                    >
                      + {nt.name} ✕
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewTech(); } }}
                  placeholder={allTechs.length === 0 ? 'Add a technology (e.g. React)' : 'Or add a new technology...'}
                  style={{ flex: 1, padding: '14px 20px', fontSize: '14px', borderRadius: '1rem', background: '#0A0A0A', border: '1px solid #1E1E1E', color: '#F0EDE8', outline: 'none' }}
                  className="hover:border-text-muted/30 focus:border-accent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={addNewTech}
                  disabled={!newTechName.trim()}
                  style={{
                    padding: '14px 24px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600,
                    cursor: newTechName.trim() ? 'pointer' : 'not-allowed',
                    background: newTechName.trim() ? 'linear-gradient(135deg, #DC2626, #EF4444)' : '#1A1A1A',
                    color: newTechName.trim() ? '#0A0A0A' : 'rgba(113, 113, 122, 0.5)',
                    border: 'none', transition: 'all 0.2s ease',
                  }}
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-text-muted/50" style={{ marginTop: '10px' }}>Click existing technologies to toggle, or add new ones — they'll be saved with the project.</p>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '12px', letterSpacing: '0.02em' }}>Skills</label>

              {allSkills.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginBottom: '16px' }}>
                  {allSkills.map(s => {
                    const selected = selectedSkillIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSkillIds(selected ? selectedSkillIds.filter(id => id !== s.id) : [...selectedSkillIds, s.id])}
                        style={{
                          padding: '10px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: `1px solid ${selected ? 'rgba(220, 38, 38, 0.45)' : '#1E1E1E'}`,
                          background: selected ? 'rgba(220, 38, 38, 0.12)' : '#0A0A0A',
                          color: selected ? '#fca5a5' : 'rgba(113, 113, 122, 0.8)',
                        }}
                        className={selected ? '' : 'hover:border-text-muted/40 hover:text-text-primary'}
                      >
                        {selected ? `${s.name} ✕` : s.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {newSkills.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginBottom: '16px' }}>
                  {newSkills.map((ns, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewSkills(newSkills.filter((_, j) => j !== i))}
                      style={{ padding: '10px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', border: '1px dashed rgba(220, 38, 38, 0.5)', background: 'rgba(220, 38, 38, 0.08)', color: '#fca5a5' }}
                    >
                      + {ns.name} ✕
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewSkill(); } }}
                  placeholder={allSkills.length === 0 ? 'Add a skill (e.g. Communication)' : 'Or add a new skill...'}
                  style={{ flex: 1, padding: '14px 20px', fontSize: '14px', borderRadius: '1rem', background: '#0A0A0A', border: '1px solid #1E1E1E', color: '#F0EDE8', outline: 'none' }}
                  className="hover:border-text-muted/30 focus:border-accent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={addNewSkill}
                  disabled={!newSkillName.trim()}
                  style={{
                    padding: '14px 24px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600,
                    cursor: newSkillName.trim() ? 'pointer' : 'not-allowed',
                    background: newSkillName.trim() ? 'linear-gradient(135deg, #DC2626, #EF4444)' : '#1A1A1A',
                    color: newSkillName.trim() ? '#0A0A0A' : 'rgba(113, 113, 122, 0.5)',
                    border: 'none', transition: 'all 0.2s ease',
                  }}
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-text-muted/50" style={{ marginTop: '10px' }}>Click existing skills to toggle, or add new ones — they'll be saved with the project.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DatePicker label="Start Date" value={toDateValue(form.timeframe_start)} onChange={(v) => setForm({ ...form, timeframe_start: v })} />
              <div>
                <DatePicker label={ongoing ? 'End Date — Present' : 'End Date'} value={ongoing ? '' : toDateValue(form.timeframe_end)} disabled={ongoing} onChange={(v) => setForm({ ...form, timeframe_end: v })} />
                <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none transition-colors duration-200" style={{ fontSize: '13px', color: ongoing ? '#fca5a5' : 'rgba(113, 113, 122, 0.8)' }}>
                  <input
                    type="checkbox"
                    checked={ongoing}
                    onChange={(e) => { setOngoing(e.target.checked); setForm({ ...form, timeframe_end: e.target.checked ? 'Present' : '' }); }}
                    className="w-4 h-4 accent-[#DC2626] cursor-pointer"
                  />
                  Currently ongoing (shows “Present”)
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4" style={{ paddingTop: '40px', borderTop: '1px solid rgba(30, 30, 30, 0.6)' }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '1rem 5rem', borderRadius: '9999px', fontSize: '15px', fontWeight: 700,
                background: saving ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
                color: '#0A0A0A', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; }}}
                onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; }}}
              >
                {saving ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={reset} className="bg-surface-elevated hover:bg-border text-text-muted text-sm font-medium transition-all duration-300" style={{ padding: '14px 28px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="animate-pulse overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1.5rem' }}>
              <div className="aspect-video" style={{ background: '#1A1A1A' }} />
              <div style={{ padding: '24px' }} className="space-y-4">
                <div style={{ height: '20px', background: '#1A1A1A', borderRadius: '8px', width: '75%' }} />
                <div style={{ height: '16px', background: '#1A1A1A', borderRadius: '8px', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center" style={{ padding: '120px 0' }}>
          <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', borderRadius: '50%', background: '#141414', border: '2px dashed rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NavIcon type="folder" className="w-10 h-10 text-text-muted/30" />
          </div>
          <h3 className="font-display font-semibold text-text-muted tracking-tight" style={{ fontSize: '28px', marginBottom: '12px' }}>No projects yet</h3>
          <p className="text-text-muted/50" style={{ fontSize: '15px', marginBottom: '40px' }}>Your portfolio is empty. Add your first project to showcase your work.</p>
          <PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Your First Project</PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(p => (
            <div key={p.id} className="group overflow-hidden transition-all duration-500" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1.5rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 48px rgba(220, 38, 38, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)'; }}
            >
              <div className="relative aspect-video overflow-hidden" style={{ background: '#1A1A1A' }}>
                <img src={p.image_url || 'https://placehold.co/480x270/1E1E1E/6B7280?text=No+Image'} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/480x270/1E1E1E/6B7280?text=No+Image'; }} />
                <div className="absolute inset-0 flex items-end justify-center pb-5 gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)' }}>
                  <button onClick={() => openEdit(p)} className="transition-all duration-200 hover:scale-110" style={{ padding: '14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Edit"><NavIcon type="edit" className="w-[18px] h-[18px] text-white" /></button>
                  <button onClick={() => setConfirmTarget(p)} className="transition-all duration-200 hover:scale-110" style={{ padding: '14px', background: 'rgba(220, 38, 38, 0.4)', backdropFilter: 'blur(8px)', borderRadius: '50%', border: 'none', cursor: 'pointer' }} title="Delete"><NavIcon type="trash" className="w-[18px] h-[18px] text-white" /></button>
                  {p.project_url && <a href={p.project_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="transition-all duration-200 hover:scale-110" style={{ padding: '14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex' }} title="Open"><NavIcon type="external" className="w-[18px] h-[18px] text-white" /></a>}
                </div>
              </div>
              <div style={{ padding: '24px 28px' }}>
                <h3 className="font-semibold text-text-primary transition-colors leading-snug" style={{ fontSize: '15px' }}>{p.title}</h3>
                {p.description && <p className="text-text-muted/70 mt-2.5 line-clamp-2 leading-relaxed" style={{ fontSize: '13px' }}>{p.description}</p>}
                <div className="flex items-center gap-4" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(30, 30, 30, 0.5)' }}>
                  {p.timeframe_start && (
                    <span className="font-mono-custom text-text-muted/50" style={{ fontSize: '12px' }}>{p.timeframe_start}{p.timeframe_end ? ` — ${p.timeframe_end}` : ''}</span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    {p.video_url && <span className="font-medium" style={{ fontSize: '11px', padding: '4px 12px', background: 'rgba(220, 38, 38, 0.1)', color: 'rgba(220, 38, 38, 0.8)', borderRadius: '9999px' }}>Video</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete project?"
        message={confirmTarget ? `This will permanently delete “${confirmTarget.title || 'this project'}” from your portfolio. This action cannot be undone.` : ''}
        onConfirm={() => { if (confirmTarget) { del(confirmTarget); setConfirmTarget(null); } }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

/* ── Section: About ── */

function AboutSection() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bio, setBio] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [paragraphs, setParagraphs] = useState<string[]>(['', '', '']);
  const [stats, setStats] = useState<{ value: string; label: string }[]>([{ value: '', label: '' }]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setSettings(d); setBio(d.bio || ''); setSubtitle(d.subtitle || 'Fullstack Developer');
      setProfileImageUrl(d.profile_image_url || '');
      setParagraphs(d.about_paragraphs?.length ? d.about_paragraphs : ['', '', '']);
      setStats(d.stats?.length ? d.stats : [{ value: '3+', label: 'Years building' }]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getKey = () => sessionStorage.getItem('admin_key') || '';

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }, body: JSON.stringify({ ...settings, bio, subtitle, profile_image_url: profileImageUrl, about_paragraphs: paragraphs.filter(p => p.trim()), stats: stats.filter(s => s.value && s.label) }) });
      if (!r.ok) throw new Error('Failed');
      setMsg({ type: 'success', text: 'About section saved!' });
    } catch { setMsg({ type: 'error', text: 'Failed to save' }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center" style={{ padding: '120px 0' }}><div className="animate-spin" style={{ width: '40px', height: '40px', border: '2px solid #DC2626', borderTopColor: 'transparent', borderRadius: '50%' }} /></div>;

  return (
    <div>
      <SectionHeader
        title="About Section"
        subtitle="Edit your profile image, bio, subtitle, about paragraphs, and stats"
        action={<PrimaryButton onClick={save} disabled={saving}><NavIcon type="check" className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}</PrimaryButton>}
      />

      <Message msg={msg} onClose={() => setMsg(null)} />

      <div style={{ padding: '4rem', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.12)', borderRadius: '1.5rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }} className="space-y-10">
        <FileUpload label="Profile Image (shown next to your name across the site)" accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif" value={profileImageUrl} onChange={setProfileImageUrl} />
        <Input label="Subtitle" type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Fullstack Developer" />
        <Input label="Bio (shown below your name on the homepage)" type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Building accessible, performant web applications from scratch." />

        <div>
          <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '12px', letterSpacing: '0.02em' }}>About Paragraphs</label>
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-1">
                  <TextArea value={p} onChange={(e) => { const copy = [...paragraphs]; copy[i] = e.target.value; setParagraphs(copy); }} placeholder={`Paragraph ${i + 1} — describe yourself...`} rows={5} />
                </div>
                {paragraphs.length > 1 && (
                  <button onClick={() => setParagraphs(paragraphs.filter((_, j) => j !== i))} className="p-3 hover:bg-surface-elevated self-start mt-1 transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}>
                    <NavIcon type="trash" className="w-5 h-5 text-text-muted hover:text-accent" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setParagraphs([...paragraphs, ''])} className="mt-4 text-sm text-accent hover:text-accent-hover transition-colors font-medium" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>+ Add paragraph</button>
        </div>

        <div style={{ paddingTop: '8px' }}>
          <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '12px', letterSpacing: '0.02em' }}>Stats (shown on the About tab)</label>
          <div className="space-y-4">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <input type="text" value={s.value} onChange={(e) => { const copy = [...stats]; copy[i] = { ...copy[i], value: e.target.value }; setStats(copy); }} placeholder="e.g. 3+" style={{ width: '120px', padding: '1.25rem 1.75rem', fontSize: '15px', borderRadius: '1rem', background: '#0A0A0A', border: '1px solid #1E1E1E', color: '#F0EDE8', outline: 'none' }} className="hover:border-text-muted/30 focus:border-accent transition-all duration-200" />
                <input type="text" value={s.label} onChange={(e) => { const copy = [...stats]; copy[i] = { ...copy[i], label: e.target.value }; setStats(copy); }} placeholder="e.g. Years building" style={{ flex: 1, padding: '1.25rem 1.75rem', fontSize: '15px', borderRadius: '1rem', background: '#0A0A0A', border: '1px solid #1E1E1E', color: '#F0EDE8', outline: 'none' }} className="hover:border-text-muted/30 focus:border-accent transition-all duration-200" />
                {stats.length > 1 && (
                  <button onClick={() => setStats(stats.filter((_, j) => j !== i))} className="p-3 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}>
                    <NavIcon type="trash" className="w-5 h-5 text-text-muted hover:text-accent" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setStats([...stats, { value: '', label: '' }])} className="mt-4 text-sm text-accent hover:text-accent-hover transition-colors font-medium" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>+ Add stat</button>
        </div>
      </div>
    </div>
  );
}

/* ── Section: Technologies ── */

function TechnologiesSection() {
  const [techs, setTechs] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Technology | null>(null);
  const [form, setForm] = useState({ name: '', category: '', icon_slug: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try { const r = await fetch('/api/technologies'); const d = await r.json(); setTechs(Array.isArray(d) ? d : []); } catch { }
    finally { setLoading(false); }
  }, []);
  const [confirmTarget, setConfirmTarget] = useState<Technology | null>(null);
  useEffect(() => { load(); }, [load]);

  const getKey = () => sessionStorage.getItem('admin_key') || '';
  const reset = () => { setForm({ name: '', category: '', icon_slug: '' }); setErrors({}); setEditing(null); setShowForm(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMsg({ type: 'error', text: 'Please fill in the required field(s).' });
      return;
    }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...form, id: editing.id } : form;
      const r = await fetch('/api/technologies', { method, headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error('Failed');
      setMsg({ type: 'success', text: editing ? 'Technology updated!' : 'Technology created!' }); reset(); load();
    } catch { setMsg({ type: 'error', text: 'Failed' }); } finally { setSaving(false); }
  };

  const del = async (t: Technology) => {
    // Optimistically remove from local state so it disappears instantly
    setTechs(prev => prev.filter(x => x.id !== t.id));
    try {
      await fetch(`/api/technologies?id=${t.id}`, { method: 'DELETE', headers: { 'x-admin-key': getKey() } });
      setMsg({ type: 'success', text: 'Deleted!' });
    } catch {
      setTechs(prev => (prev.some(x => x.id === t.id) ? prev : [...prev, t]));
      setMsg({ type: 'error', text: 'Failed' });
    }
  };

  const grouped = techs.reduce((acc: Record<string, Technology[]>, t) => { const cat = t.category || 'Other'; if (!acc[cat]) acc[cat] = []; acc[cat].push(t); return acc; }, {});

  return (
    <div>
      <SectionHeader
        title="Technologies"
        subtitle={`${techs.length} technologies in your stack`}
        action={<PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Technology</PrimaryButton>}
      />

      <Message msg={msg} onClose={() => setMsg(null)} />

      {showForm && (
        <Modal title={editing ? 'Edit Technology' : 'New Technology'} onClose={reset}>
          <form onSubmit={submit} noValidate className="flex flex-col" style={{ gap: '32px' }}>
            <Input label="Name *" type="text" value={form.name} error={errors.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }} placeholder="React" required />
            <Input label="Category" type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Frontend, Backend, Tools..." />
            <Input label="Icon Slug (simpleicons.org)" type="text" value={form.icon_slug} onChange={(e) => setForm({ ...form, icon_slug: e.target.value })} placeholder="e.g. react, nextdotjs, typescript" />
            {form.icon_slug && (
              <div className="flex items-center gap-5" style={{ padding: '20px', background: '#1A1A1A', borderRadius: '1rem', border: '1px solid #1E1E1E' }}>
                <img src={`https://cdn.simpleicons.org/${form.icon_slug.toLowerCase()}/DC2626`} alt="" className="w-9 h-9" onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.simpleicons.org/${form.icon_slug.toLowerCase()}/888`; }} />
                <div>
                  <p className="font-medium text-text-primary" style={{ fontSize: '15px' }}>Icon Preview</p>
                  <p className="text-sm text-text-muted">simpleicons.org — &ldquo;{form.icon_slug}&rdquo;</p>
                </div>
              </div>
            )}
            <div className="flex gap-4" style={{ paddingTop: '40px', borderTop: '1px solid rgba(30, 30, 30, 0.6)' }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '1rem 5rem', borderRadius: '9999px', fontSize: '15px', fontWeight: 700,
                background: saving ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
                color: '#0A0A0A', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; }}}
                onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; }}}
              >
                {saving ? 'Saving...' : editing ? 'Update Technology' : 'Create Technology'}
              </button>
              <button type="button" onClick={reset} className="bg-surface-elevated hover:bg-border text-text-muted text-sm font-medium transition-all duration-300" style={{ padding: '14px 28px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '32px' }}><div style={{ height: '24px', background: '#1A1A1A', borderRadius: '8px', width: '75%', margin: '0 auto 12px' }} /><div style={{ height: '16px', background: '#1A1A1A', borderRadius: '8px', width: '50%', margin: '0 auto' }} /></div>)}
        </div>
      ) : techs.length === 0 ? (
        <div className="text-center" style={{ padding: '120px 0' }}>
          <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', borderRadius: '50%', background: '#141414', border: '2px dashed rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NavIcon type="code" className="w-10 h-10 text-text-muted/30" />
          </div>
          <h3 className="font-display font-semibold text-text-muted tracking-tight" style={{ fontSize: '28px', marginBottom: '12px' }}>No technologies yet</h3>
          <p className="text-text-muted/50" style={{ fontSize: '15px', marginBottom: '40px' }}>Add the technologies and tools you work with.</p>
          <PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Your First Technology</PrimaryButton>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
                <div style={{ width: '6px', height: '24px', background: 'rgba(220, 38, 38, 0.6)', borderRadius: '3px' }} />
                <h3 className="font-mono-custom text-accent/80 font-medium" style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{category}</h3>
                <span className="text-text-muted/50 text-sm">({items.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {items.map(t => (
                  <div key={t.id} className="group relative transition-all duration-300" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '32px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)'; e.currentTarget.style.background = 'rgba(220, 38, 38, 0.03)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.1)'; e.currentTarget.style.background = '#141414'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div className="flex items-center justify-center" style={{ marginBottom: '16px' }}>
                      <img src={`https://cdn.simpleicons.org/${t.icon_slug?.toLowerCase() || 'undefined'}/888`} alt="" className="w-10 h-10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <p className="font-semibold text-center transition-colors" style={{ fontSize: '14px', color: '#A1A1AA' }}>{t.name}</p>
                    <div className="flex items-center justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => { setForm({ name: t.name, category: t.category, icon_slug: t.icon_slug }); setErrors({}); setEditing(t); setShowForm(true); }} className="p-2 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="edit" className="w-4 h-4 text-text-muted" /></button>
                      <button onClick={() => setConfirmTarget(t)} className="p-2 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="trash" className="w-4 h-4 text-text-muted hover:text-accent" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete technology?"
        message={confirmTarget ? `This will permanently delete “${confirmTarget.name || 'this technology'}” from your stack. This action cannot be undone.` : ''}
        onConfirm={() => { if (confirmTarget) { del(confirmTarget); setConfirmTarget(null); } }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

/* ── Section: Skills ── */

function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({ name: '', category: '', icon_slug: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryMode, setCategoryMode] = useState<'select' | 'new'>('select');

  const load = useCallback(async () => {
    try { const r = await fetch('/api/skills'); const d = await r.json(); setSkills(Array.isArray(d) ? d : []); } catch { }
    finally { setLoading(false); }
  }, []);
  const [confirmTarget, setConfirmTarget] = useState<Skill | null>(null);
  useEffect(() => { load(); }, [load]);

  const existingCategories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  const getKey = () => sessionStorage.getItem('admin_key') || '';
  const reset = () => { setForm({ name: '', category: '', icon_slug: '' }); setErrors({}); setCategoryMode('select'); setEditing(null); setShowForm(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMsg({ type: 'error', text: 'Please fill in the required field(s).' });
      return;
    }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...form, id: editing.id } : form;
      const r = await fetch('/api/skills', { method, headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error('Failed');
      setMsg({ type: 'success', text: editing ? 'Skill updated!' : 'Skill created!' }); reset(); load();
    } catch { setMsg({ type: 'error', text: 'Failed' }); } finally { setSaving(false); }
  };

  const del = async (s: Skill) => {
    // Optimistically remove from local state so it disappears instantly
    setSkills(prev => prev.filter(x => x.id !== s.id));
    try {
      await fetch(`/api/skills?id=${s.id}`, { method: 'DELETE', headers: { 'x-admin-key': getKey() } });
      setMsg({ type: 'success', text: 'Deleted!' });
    } catch {
      setSkills(prev => (prev.some(x => x.id === s.id) ? prev : [...prev, s]));
      setMsg({ type: 'error', text: 'Failed' });
    }
  };

  const grouped = skills.reduce((acc: Record<string, Skill[]>, s) => { const cat = s.category || 'Other'; if (!acc[cat]) acc[cat] = []; acc[cat].push(s); return acc; }, {});

  return (
    <div>
      <SectionHeader
        title="Skills"
        subtitle={`${skills.length} skill${skills.length !== 1 ? 's' : ''} in your profile`}
        action={<PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Skill</PrimaryButton>}
      />

      <Message msg={msg} onClose={() => setMsg(null)} />

      {showForm && (
        <Modal title={editing ? 'Edit Skill' : 'New Skill'} onClose={reset}>
          <form onSubmit={submit} noValidate className="flex flex-col" style={{ gap: '32px' }}>
            <Input label="Name *" type="text" value={form.name} error={errors.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }} placeholder="Communication" required />

            {/* Category — pick an existing one or add a new one */}
            <div>
              <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '10px', letterSpacing: '0.02em' }}>Category</label>
              <select
                value={categoryMode === 'new' ? '__new__' : form.category}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__new__') { setCategoryMode('new'); setForm({ ...form, category: '' }); }
                  else { setCategoryMode('select'); setForm({ ...form, category: v }); }
                }}
                style={{ width: '100%', padding: '1.25rem 1.75rem', fontSize: '15px', borderRadius: '1rem', colorScheme: 'dark', cursor: 'pointer' }}
                className={`w-full bg-bg border text-text-primary focus:outline-none transition-all duration-200 ${form.category || categoryMode === 'new' ? '' : 'text-text-muted/40'}`}
              >
                <option value="">Select a category</option>
                {existingCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__new__">+ Add new category...</option>
              </select>
              {categoryMode === 'new' && (
                <Input
                  label="New Category Name"
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Soft Skills"
                />
              )}
            </div>

            <Input label="Icon Slug (simpleicons.org, optional)" type="text" value={form.icon_slug} onChange={(e) => setForm({ ...form, icon_slug: e.target.value })} placeholder="e.g. git, figma, linux" />
            {form.icon_slug && (
              <div className="flex items-center gap-5" style={{ padding: '20px', background: '#1A1A1A', borderRadius: '1rem', border: '1px solid #1E1E1E' }}>
                <img src={`https://cdn.simpleicons.org/${form.icon_slug.toLowerCase()}/DC2626`} alt="" className="w-9 h-9" onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.simpleicons.org/${form.icon_slug.toLowerCase()}/888`; }} />
                <div>
                  <p className="font-medium text-text-primary" style={{ fontSize: '15px' }}>Icon Preview</p>
                  <p className="text-sm text-text-muted">simpleicons.org — &ldquo;{form.icon_slug}&rdquo;</p>
                </div>
              </div>
            )}
            <div className="flex gap-4" style={{ paddingTop: '40px', borderTop: '1px solid rgba(30, 30, 30, 0.6)' }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '1rem 5rem', borderRadius: '9999px', fontSize: '15px', fontWeight: 700,
                background: saving ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
                color: '#0A0A0A', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; }}}
                onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; }}}
              >
                {saving ? 'Saving...' : editing ? 'Update Skill' : 'Create Skill'}
              </button>
              <button type="button" onClick={reset} className="bg-surface-elevated hover:bg-border text-text-muted text-sm font-medium transition-all duration-300" style={{ padding: '14px 28px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '32px' }}><div style={{ height: '24px', background: '#1A1A1A', borderRadius: '8px', width: '75%', margin: '0 auto 12px' }} /><div style={{ height: '16px', background: '#1A1A1A', borderRadius: '8px', width: '50%', margin: '0 auto' }} /></div>)}
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center" style={{ padding: '120px 0' }}>
          <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', borderRadius: '50%', background: '#141414', border: '2px dashed rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NavIcon type="star" className="w-10 h-10 text-text-muted/30" />
          </div>
          <h3 className="font-display font-semibold text-text-muted tracking-tight" style={{ fontSize: '28px', marginBottom: '12px' }}>No skills yet</h3>
          <p className="text-text-muted/50" style={{ fontSize: '15px', marginBottom: '40px' }}>Add the skills you want to highlight on your profile.</p>
          <PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Your First Skill</PrimaryButton>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
                <div style={{ width: '6px', height: '24px', background: 'rgba(220, 38, 38, 0.6)', borderRadius: '3px' }} />
                <h3 className="font-mono-custom text-accent/80 font-medium" style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{category}</h3>
                <span className="text-text-muted/50 text-sm">({items.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {items.map(s => (
                  <div key={s.id} className="group relative transition-all duration-300" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '32px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)'; e.currentTarget.style.background = 'rgba(220, 38, 38, 0.03)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.1)'; e.currentTarget.style.background = '#141414'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div className="flex items-center justify-center" style={{ marginBottom: '16px' }}>
                      <img src={`https://cdn.simpleicons.org/${s.icon_slug?.toLowerCase() || 'undefined'}/888`} alt="" className="w-10 h-10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <p className="font-semibold text-center transition-colors" style={{ fontSize: '14px', color: '#A1A1AA' }}>{s.name}</p>
                    <div className="flex items-center justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => { setForm({ name: s.name, category: s.category, icon_slug: s.icon_slug }); setErrors({}); setCategoryMode(s.category && existingCategories.includes(s.category) ? 'select' : s.category ? 'new' : 'select'); setEditing(s); setShowForm(true); }} className="p-2 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="edit" className="w-4 h-4 text-text-muted" /></button>
                      <button onClick={() => setConfirmTarget(s)} className="p-2 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="trash" className="w-4 h-4 text-text-muted hover:text-accent" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete skill?"
        message={confirmTarget ? `This will permanently delete “${confirmTarget.name || 'this skill'}” from your profile. This action cannot be undone.` : ''}
        onConfirm={() => { if (confirmTarget) { del(confirmTarget); setConfirmTarget(null); } }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

/* ── Section: Socials ── */

function SocialsSection() {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [form, setForm] = useState({ platform: '', url: '', icon_slug: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try { const r = await fetch('/api/socials'); const d = await r.json(); setSocials(Array.isArray(d) ? d : []); } catch { }
    finally { setLoading(false); }
  }, []);
  const [confirmTarget, setConfirmTarget] = useState<SocialLink | null>(null);
  useEffect(() => { load(); }, [load]);

  const getKey = () => sessionStorage.getItem('admin_key') || '';
  const reset = () => { setForm({ platform: '', url: '', icon_slug: '' }); setErrors({}); setEditing(null); setShowForm(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.platform.trim()) newErrors.platform = 'Platform name is required';
    if (form.url.trim() && !/^https?:\/\//i.test(form.url.trim())) newErrors.url = 'Enter a valid URL starting with http:// or https://';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMsg({ type: 'error', text: 'Please fill in the required field(s).' });
      return;
    }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...form, id: editing.id } : form;
      const r = await fetch('/api/socials', { method, headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error('Failed');
      setMsg({ type: 'success', text: editing ? 'Social link updated!' : 'Social link created!' }); reset(); load();
    } catch { setMsg({ type: 'error', text: 'Failed' }); } finally { setSaving(false); }
  };

  const del = async (s: SocialLink) => {
    // Optimistically remove from local state so it disappears instantly
    setSocials(prev => prev.filter(x => x.id !== s.id));
    try {
      await fetch(`/api/socials?id=${s.id}`, { method: 'DELETE', headers: { 'x-admin-key': getKey() } });
      setMsg({ type: 'success', text: 'Deleted!' });
    } catch {
      setSocials(prev => (prev.some(x => x.id === s.id) ? prev : [...prev, s]));
      setMsg({ type: 'error', text: 'Failed' });
    }
  };

  return (
    <div>
      <SectionHeader
        title="Social Links"
        subtitle="Manage the social links displayed on your portfolio's Connect tab"
        action={<PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Social Link</PrimaryButton>}
      />

      <Message msg={msg} onClose={() => setMsg(null)} />

      {showForm && (
        <Modal title={editing ? 'Edit Social Link' : 'New Social Link'} onClose={reset}>
          <form onSubmit={submit} noValidate className="flex flex-col" style={{ gap: '32px' }}>
            <Input label="Platform Name *" type="text" value={form.platform} error={errors.platform} onChange={(e) => { setForm({ ...form, platform: e.target.value }); if (errors.platform) setErrors({ ...errors, platform: '' }); }} placeholder="GitHub, LinkedIn, Twitter..." required />
            <Input label="Profile URL" type="url" value={form.url} error={errors.url} onChange={(e) => { setForm({ ...form, url: e.target.value }); if (errors.url) setErrors({ ...errors, url: '' }); }} placeholder="https://github.com/username" />
            <Input label="Icon Slug" type="text" value={form.icon_slug} onChange={(e) => setForm({ ...form, icon_slug: e.target.value })} placeholder="e.g. github, linkedin, x" />
            {form.icon_slug && (
              <div className="flex items-center gap-5" style={{ padding: '20px', background: '#1A1A1A', borderRadius: '1rem', border: '1px solid #1E1E1E' }}>
                <img src={`https://cdn.simpleicons.org/${form.icon_slug.toLowerCase()}/DC2626`} alt="" className="w-8 h-8" onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.simpleicons.org/${form.icon_slug.toLowerCase()}/888`; }} />
                <div>
                  <p className="font-medium text-text-primary" style={{ fontSize: '15px' }}>{form.platform || form.icon_slug}</p>
                  <p className="text-sm text-text-muted">simpleicons.org icon preview</p>
                </div>
              </div>
            )}
            <div className="flex gap-4" style={{ paddingTop: '40px', borderTop: '1px solid rgba(30, 30, 30, 0.6)' }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '1rem 5rem', borderRadius: '9999px', fontSize: '15px', fontWeight: 700,
                background: saving ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
                color: '#0A0A0A', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; }}}
                onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; }}}
              >
                {saving ? 'Saving...' : editing ? 'Update Link' : 'Add Link'}
              </button>
              <button type="button" onClick={reset} className="bg-surface-elevated hover:bg-border text-text-muted text-sm font-medium transition-all duration-300" style={{ padding: '14px 28px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <div className="space-y-5">
          {[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '28px' }}><div style={{ height: '28px', background: '#1A1A1A', borderRadius: '8px', width: '33%' }} /></div>)}
        </div>
      ) : socials.length === 0 ? (
        <div className="text-center" style={{ padding: '120px 0' }}>
          <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', borderRadius: '50%', background: '#141414', border: '2px dashed rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NavIcon type="link" className="w-10 h-10 text-text-muted/30" />
          </div>
          <h3 className="font-display font-semibold text-text-muted tracking-tight" style={{ fontSize: '28px', marginBottom: '12px' }}>No social links yet</h3>
          <p className="text-text-muted/50" style={{ fontSize: '15px', marginBottom: '40px' }}>Add your social media profiles so visitors can connect with you.</p>
          <PrimaryButton onClick={() => { reset(); setShowForm(true); }}><NavIcon type="plus" className="w-5 h-5" /> Add Your First Link</PrimaryButton>
        </div>
      ) : (
        <div className="space-y-5">
          {socials.map(s => (
            <div key={s.id} className="group flex items-center justify-between transition-all duration-300" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '24px 32px' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)'; e.currentTarget.style.background = 'rgba(220, 38, 38, 0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.1)'; e.currentTarget.style.background = '#141414'; }}
            >
              <div className="flex items-center gap-5">
                <div style={{ padding: '12px', borderRadius: '10px', background: '#1A1A1A', border: '1px solid #1E1E1E' }}>
                  <img src={`https://cdn.simpleicons.org/${s.icon_slug?.toLowerCase() || 'undefined'}/888`} alt="" className="w-7 h-7" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div>
                  <p className="font-semibold text-text-primary transition-colors" style={{ fontSize: '15px' }}>{s.platform}</p>
                  <p className="text-text-muted/70 mt-1 font-mono-custom" style={{ fontSize: '13px' }}>{s.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button onClick={() => { setForm({ platform: s.platform, url: s.url, icon_slug: s.icon_slug }); setErrors({}); setEditing(s); setShowForm(true); }} className="p-2.5 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }} title="Edit"><NavIcon type="edit" className="w-4 h-4 text-text-muted" /></button>
                <button onClick={() => setConfirmTarget(s)} className="p-2.5 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }} title="Delete"><NavIcon type="trash" className="w-4 h-4 text-text-muted hover:text-accent" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete social link?"
        message={confirmTarget ? `This will permanently delete “${confirmTarget.platform || 'this social link'}” from your Connect tab. This action cannot be undone.` : ''}
        onConfirm={() => { if (confirmTarget) { del(confirmTarget); setConfirmTarget(null); } }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

/* ── Section: Resume ── */

function ResumeSection() {
  const [settings, setSettings] = useState<any>(null);
  const [exp, setExp] = useState<any[]>([]);
  const [edu, setEdu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', company: '', description: '', year_start: '', year_end: '', type: 'experience' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resumeIntro, setResumeIntro] = useState('');
  const [resumePdfUrl, setResumePdfUrl] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<{ item: any; type: 'experience' | 'education' } | null>(null);

  const load = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([fetch('/api/settings'), fetch('/api/resume')]);
      const s = await r1.json(); const rd = await r2.json();
      setSettings(s); setResumeIntro(s.resume_intro || ''); setResumePdfUrl(s.resume_pdf_url || '');
      setExp(rd.experience || []); setEdu(rd.education || []);
    } catch { }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const getKey = () => sessionStorage.getItem('admin_key') || '';
  const reset = () => { setForm({ title: '', company: '', description: '', year_start: '', year_end: '', type: 'experience' }); setErrors({}); setEditing(null); setShowForm(false); };

  const saveSettings = async () => {
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }, body: JSON.stringify({ ...settings, resume_intro: resumeIntro, resume_pdf_url: resumePdfUrl }) });
      setMsg({ type: 'success', text: 'Resume settings saved!' });
    } catch { setMsg({ type: 'error', text: 'Failed to save settings' }); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = form.type === 'education' ? 'Degree is required' : 'Job title is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMsg({ type: 'error', text: 'Please fill in the required field(s).' });
      return;
    }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...form, id: editing.id } : form;
      const r = await fetch('/api/resume', { method, headers: { 'Content-Type': 'application/json', 'x-admin-key': getKey() }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error('Failed');
      setMsg({ type: 'success', text: editing ? 'Entry updated!' : 'Entry created!' }); reset(); load();
    } catch { setMsg({ type: 'error', text: 'Failed' }); } finally { setSaving(false); }
  };

  const del = async (item: any, type: string) => {
    // Optimistically remove from local state so it disappears instantly
    if (type === 'experience') setExp(prev => prev.filter(e => e.id !== item.id));
    else setEdu(prev => prev.filter(e => e.id !== item.id));
    try {
      await fetch(`/api/resume?id=${item.id}&type=${type}`, { method: 'DELETE', headers: { 'x-admin-key': getKey() } });
      setMsg({ type: 'success', text: 'Deleted!' });
    } catch {
      if (type === 'experience') setExp(prev => (prev.some(e => e.id === item.id) ? prev : [...prev, item]));
      else setEdu(prev => (prev.some(e => e.id === item.id) ? prev : [...prev, item]));
      setMsg({ type: 'error', text: 'Failed' });
    }
  };

  if (loading) return <div className="flex items-center justify-center" style={{ padding: '120px 0' }}><div className="animate-spin" style={{ width: '40px', height: '40px', border: '2px solid #DC2626', borderTopColor: 'transparent', borderRadius: '50%' }} /></div>;

  return (
    <div className="space-y-14">
      <SectionHeader title="Resume" subtitle="Manage your resume content, experience, education, and PDF" />

      <Message msg={msg} onClose={() => setMsg(null)} />

      <div style={{ padding: '4rem', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.12)', borderRadius: '1.5rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }} className="space-y-8">
        <h3 className="font-display font-semibold text-text-primary tracking-tight" style={{ fontSize: '20px' }}>Resume Settings</h3>
        <TextArea label="Resume Intro Text" value={resumeIntro} onChange={(e) => setResumeIntro(e.target.value)} placeholder="Everything about my experience, education, and technical background..." rows={4} />            <FileUpload label="Resume PDF" accept="application/pdf,.pdf" value={resumePdfUrl} onChange={setResumePdfUrl} />
        <div style={{ marginTop: '24px' }}>
          <PrimaryButton onClick={saveSettings}><NavIcon type="check" className="w-5 h-5" /> Save Settings</PrimaryButton>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div className="flex items-center gap-4">
            <div style={{ width: '6px', height: '28px', background: 'rgba(220, 38, 38, 0.6)', borderRadius: '3px' }} />
            <h3 className="font-display font-semibold text-text-primary tracking-tight" style={{ fontSize: '20px' }}>Experience</h3>
            <span className="text-text-muted/50 font-mono-custom text-sm">({exp.length})</span>
          </div>
          <SecondaryButton onClick={() => { reset(); setForm({ ...form, type: 'experience' }); setShowForm(true); }}><NavIcon type="plus" className="w-4 h-4" /> Add Experience</SecondaryButton>
        </div>
        {exp.length === 0 ? (
          <div className="text-center space-y-5" style={{ padding: '80px 0', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1.5rem' }}>
            <p className="text-text-muted/60" style={{ fontSize: '15px' }}>No experience entries yet.</p>
            <SecondaryButton onClick={() => { reset(); setForm({ ...form, type: 'experience' }); setShowForm(true); }}><NavIcon type="plus" className="w-4 h-4" /> Add Experience</SecondaryButton>
          </div>
        ) : (
          <div className="space-y-5">
            {exp.map((e: any) => (
              <div key={e.id} className="group flex items-start justify-between transition-all duration-300" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '24px 32px' }}
                onMouseEnter={(e2) => { e2.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)'; }}
                onMouseLeave={(e2) => { e2.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.1)'; }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4" style={{ marginBottom: '6px' }}>
                    <h4 className="font-semibold text-text-primary" style={{ fontSize: '15px' }}>{e.title}</h4>
                    <span className="text-text-muted/50 font-mono-custom" style={{ fontSize: '12px', padding: '4px 12px', background: '#1A1A1A', borderRadius: '9999px' }}>{e.year_start}{e.year_end ? ` — ${e.year_end}` : ''}</span>
                  </div>
                  <p className="text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '12px' }}>{e.company}</p>
                  {e.description && <p className="text-text-muted/70 leading-relaxed" style={{ fontSize: '13px' }}>{e.description}</p>}
                </div>
                <div className="flex items-center gap-2 ml-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button onClick={() => { setForm({ title: e.title, company: e.company, description: e.description || '', year_start: e.year_start, year_end: e.year_end, type: 'experience' }); setErrors({}); setEditing(e); setShowForm(true); }} className="p-2.5 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="edit" className="w-4 h-4 text-text-muted" /></button>
                  <button onClick={() => setConfirmTarget({ item: e, type: 'experience' })} className="p-2.5 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="trash" className="w-4 h-4 text-text-muted hover:text-accent" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
          <div className="flex items-center gap-4">
            <div style={{ width: '6px', height: '28px', background: 'rgba(220, 38, 38, 0.6)', borderRadius: '3px' }} />
            <h3 className="font-display font-semibold text-text-primary tracking-tight" style={{ fontSize: '20px' }}>Education</h3>
            <span className="text-text-muted/50 font-mono-custom text-sm">({edu.length})</span>
          </div>
          <SecondaryButton onClick={() => { reset(); setForm({ ...form, type: 'education' }); setShowForm(true); }}><NavIcon type="plus" className="w-4 h-4" /> Add Education</SecondaryButton>
        </div>
        {edu.length === 0 ? (          <div className="text-center space-y-5" style={{ padding: '80px 0', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1.5rem' }}>
            <p className="text-text-muted/60" style={{ fontSize: '15px' }}>No education entries yet.</p>
            <SecondaryButton onClick={() => { reset(); setForm({ ...form, type: 'education' }); setShowForm(true); }}><NavIcon type="plus" className="w-4 h-4" /> Add Education</SecondaryButton>
          </div>
        ) : (
          <div className="space-y-5">
            {edu.map((e: any) => (
              <div key={e.id} className="group flex items-start justify-between transition-all duration-300" style={{ background: '#141414', border: '1px solid rgba(220, 38, 38, 0.1)', borderRadius: '1rem', padding: '24px 32px' }}
                onMouseEnter={(e2) => { e2.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)'; }}
                onMouseLeave={(e2) => { e2.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.1)'; }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4" style={{ marginBottom: '6px' }}>
                    <h4 className="font-semibold text-text-primary" style={{ fontSize: '15px' }}>{e.degree}</h4>
                    <span className="text-text-muted/50 font-mono-custom" style={{ fontSize: '12px', padding: '4px 12px', background: '#1A1A1A', borderRadius: '9999px' }}>{e.year_start}{e.year_end ? ` — ${e.year_end}` : ''}</span>
                  </div>
                  <p className="text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '12px' }}>{e.school}</p>
                  {e.description && <p className="text-text-muted/70 leading-relaxed" style={{ fontSize: '13px' }}>{e.description}</p>}
                </div>
                <div className="flex items-center gap-2 ml-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button onClick={() => { setForm({ title: e.degree, company: e.school, description: e.description || '', year_start: e.year_start, year_end: e.year_end, type: 'education' }); setErrors({}); setEditing({ ...e, _type: 'education' }); setShowForm(true); }} className="p-2.5 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="edit" className="w-4 h-4 text-text-muted" /></button>
                  <button onClick={() => setConfirmTarget({ item: e, type: 'education' })} className="p-2.5 hover:bg-surface-elevated transition-colors" style={{ borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent' }}><NavIcon type="trash" className="w-4 h-4 text-text-muted hover:text-accent" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Entry' : 'New Entry'} onClose={reset}>
          <form onSubmit={submit} noValidate className="flex flex-col" style={{ gap: '32px' }}>
            <Input label={form.type === 'education' ? 'Degree / Title *' : 'Job Title *'} type="text" value={form.title} error={errors.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }} placeholder={form.type === 'education' ? 'B.Sc. Computer Science' : 'Senior Fullstack Developer'} required />
            <Input label={form.type === 'education' ? 'School / Institution' : 'Company'} type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder={form.type === 'education' ? 'University of Technology' : 'Tech Corp'} />
            <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your role, responsibilities, and achievements..." rows={4} />
            <div className="grid grid-cols-2 gap-6">
              <Input label="Year Start" type="text" value={form.year_start} onChange={(e) => setForm({ ...form, year_start: e.target.value })} placeholder="e.g. 2021" />
              <Input label="Year End" type="text" value={form.year_end} onChange={(e) => setForm({ ...form, year_end: e.target.value })} placeholder="e.g. 2024 or Present" />
            </div>
            <div className="flex gap-4" style={{ paddingTop: '40px', borderTop: '1px solid rgba(30, 30, 30, 0.6)' }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '1rem 5rem', borderRadius: '9999px', fontSize: '15px', fontWeight: 700,
                background: saving ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
                color: '#0A0A0A', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; }}}
                onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; }}}
              >
                {saving ? 'Saving...' : editing ? 'Update Entry' : 'Create Entry'}
              </button>
              <button type="button" onClick={reset} className="bg-surface-elevated hover:bg-border text-text-muted text-sm font-medium transition-all duration-300" style={{ padding: '14px 28px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.type === 'education' ? 'Delete education entry?' : 'Delete experience entry?'}
        message={confirmTarget ? `This will permanently delete “${confirmTarget.type === 'education' ? (confirmTarget.item.degree || 'this entry') : (confirmTarget.item.title || 'this entry')}” from your resume. This action cannot be undone.` : ''}
        onConfirm={() => { if (confirmTarget) { del(confirmTarget.item, confirmTarget.type); setConfirmTarget(null); } }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

/* ── Section: Settings ── */

function SettingsSection() {
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runMigration = async () => {
    setMigrating(true);
    try {
      const r = await fetch('/api/migrate', { method: 'POST', headers: { 'x-admin-key': sessionStorage.getItem('admin_key') || '' } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Migration failed');
      setMsg({ type: 'success', text: d.message || 'Database migration completed!' });
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setMigrating(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
    else if (!STRONG_PASSWORD_RE.test(newPassword)) newErrors.newPassword = STRONG_PASSWORD_HINT;
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your new password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'New passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMsg({ type: 'error', text: 'Please fix the fields highlighted below.' });
      return;
    }
    setSaving(true);
    try {
      const r = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': sessionStorage.getItem('admin_key') || '' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Failed');
      setMsg({ type: 'success', text: 'Password updated! The change takes effect immediately for this session.' });
      sessionStorage.setItem('admin_key', newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setErrors({});
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-10">
      <SectionHeader title="Settings" subtitle="Change your admin password and manage account settings" />

      <Message msg={msg} onClose={() => setMsg(null)} />

      <div style={{ padding: '4rem', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.12)', borderRadius: '1.5rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', marginBottom: '2%' }}>
        <div className="flex items-center gap-5" style={{ marginBottom: '40px' }}>
          <div style={{ padding: '16px', borderRadius: '1rem', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <h3 className="font-display font-semibold text-text-primary tracking-tight" style={{ fontSize: '20px' }}>Change Password</h3>
            <p className="text-text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>Update your admin dashboard password</p>
          </div>
        </div>
        <form onSubmit={changePassword} noValidate className="space-y-10" style={{ maxWidth: '480px' }}>
          <Input label="Current Password" type="password" value={currentPassword} error={errors.currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' }); }} placeholder="Enter your current password" required />
          <div>
            <Input label="New Password" type="password" value={newPassword} error={errors.newPassword} onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors({ ...errors, newPassword: '' }); }} placeholder="Enter a new password" required minLength={8} />
            <p className="text-xs text-text-muted/50" style={{ marginTop: '10px' }}>{STRONG_PASSWORD_HINT}</p>
          </div>
          <Input label="Confirm New Password" type="password" value={confirmPassword} error={errors.confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }); }} placeholder="Confirm your new password" required />
          <div style={{ paddingTop: '40px' }}>
            <button type="submit" disabled={saving} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '1rem 5rem',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 700,
              background: saving ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
              color: '#0A0A0A',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; }}}
              onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; }}}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Database Setup */}
      <div style={{ padding: '4rem', background: '#141414', border: '1px solid rgba(220, 38, 38, 0.12)', borderRadius: '1.5rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
        <div className="flex items-center gap-5" style={{ marginBottom: '28px' }}>
          <div style={{ padding: '16px', borderRadius: '1rem', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <h3 className="font-display font-semibold text-text-primary tracking-tight" style={{ fontSize: '20px' }}>Database Setup</h3>
            <p className="text-text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>Create or update all database tables</p>
          </div>
        </div>
        <p className="text-text-muted" style={{ fontSize: '13px', lineHeight: '1.8', maxWidth: '560px', marginBottom: '32px' }}>
          Run this once after deploying a new version to make sure all tables (projects, technologies, skills, socials, resume, etc.) exist in your database. It is safe to run multiple times.
        </p>
        <button
          type="button"
          onClick={runMigration}
          disabled={migrating}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '1rem 3rem',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 700,
            background: migrating ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(239, 68, 68, 0.5))' : 'linear-gradient(135deg, #DC2626, #EF4444)',
            color: '#0A0A0A',
            border: 'none',
            cursor: migrating ? 'not-allowed' : 'pointer',
            boxShadow: migrating ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { if (!migrating) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.35)'; }}}
          onMouseLeave={(e) => { if (!migrating) { e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.25)'; }}}
        >
          {migrating ? 'Running migration...' : 'Run Database Migration'}
        </button>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */

function ManageSiteContent() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('projects');

  const renderSection = () => {
    switch (activeTab) {
      case 'projects': return <ProjectsSection />;
      case 'about': return <AboutSection />;
      case 'technologies': return <TechnologiesSection />;
      case 'skills': return <SkillsSection />;
      case 'socials': return <SocialsSection />;
      case 'resume': return <ResumeSection />;
      case 'settings': return <SettingsSection />;
      default: return <ProjectsSection />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderSection()}
    </AdminLayout>
  );
}

export default function ManageSite() {
  return (
    <AuthGate>
      <ManageSiteContent />
    </AuthGate>
  );
}
