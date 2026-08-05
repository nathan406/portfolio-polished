'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const MIN_YEAR = 2020;
const MAX_YEAR = new Date().getFullYear() + 5;
const POPUP_WIDTH = 312;

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseISO(value: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}

function formatDisplay(value: string): string {
  const p = parseISO(value);
  if (!p) return '';
  return new Date(p.y, p.m, p.d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function CalendarIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function DatePicker({
  label,
  value,
  onChange,
  disabled = false,
  error,
  placeholder = 'Select a date',
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [view, setView] = useState(() => {
    const p = parseISO(value);
    const today = new Date();
    return { y: p ? p.y : today.getFullYear(), m: p ? p.m : today.getMonth() };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const openPicker = useCallback(() => {
    if (disabled) return;
    const p = parseISO(value);
    const today = new Date();
    setView({
      y: p ? Math.max(MIN_YEAR, p.y) : today.getFullYear(),
      m: p ? p.m : today.getMonth(),
    });
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8));
      const top = Math.min(rect.bottom + 8, window.innerHeight - 380);
      setPos({ top, left });
    }
    setOpen(true);
  }, [disabled, value]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside =
        (containerRef.current && containerRef.current.contains(target)) ||
        (popupRef.current && popupRef.current.contains(target));
      if (!inside) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = parseISO(value);

  // First weekday (0 = Sunday) of the visible month
  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () =>
    setView((v) => {
      if (v.m === 0) {
        return v.y - 1 < MIN_YEAR ? v : { y: v.y - 1, m: 11 };
      }
      return { ...v, m: v.m - 1 };
    });
  const nextMonth = () =>
    setView((v) => {
      if (v.m === 11) {
        return v.y + 1 > MAX_YEAR ? v : { y: v.y + 1, m: 0 };
      }
      return { ...v, m: v.m + 1 };
    });

  const pick = (day: number) => {
    onChange(`${view.y}-${pad(view.m + 1)}-${pad(day)}`);
    setOpen(false);
  };

  const years: number[] = [];
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) years.push(y);

  const popup = open && pos ? (
    createPortal(
      <div
        ref={popupRef}
        className="animate-fade-in"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: POPUP_WIDTH,
          background: '#1A1A1A',
          border: '1px solid #2a2a2a',
          borderRadius: '1.25rem',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          zIndex: 100,
        }}
        role="dialog"
        aria-label={label}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-[22px] pt-4">
          <button
            type="button"
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-[#272727] hover:text-text-primary transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary" style={{ minWidth: '84px', textAlign: 'center' }}>
              {MONTHS[view.m]}
            </span>
            <select
              value={view.y}
              onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))}
              className="bg-[#141414] border border-[#2a2a2a] text-text-primary text-sm font-medium rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-colors cursor-pointer"
              style={{ colorScheme: 'dark' }}
              aria-label="Select year"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-[#272727] hover:text-text-primary transition-colors"
            aria-label="Next month"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Weekday row */}
        <div className="grid grid-cols-7 px-[22px] mt-4">
          {WEEKDAYS.map((w) => (
            <span key={w} className="text-center text-[11px] font-medium text-text-muted/60" style={{ letterSpacing: '0.05em' }}>
              {w}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 px-[22px] pb-2 mt-1">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = !!selected && selected.y === view.y && selected.m === view.m && selected.d === day;
            const isToday = today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => pick(day)}
                className={`w-9 h-9 mx-auto flex items-center justify-center text-sm rounded-full transition-all duration-150 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white font-semibold shadow-lg shadow-accent/25'
                    : 'text-text-secondary hover:bg-[#272727] hover:text-text-primary'
                } ${isToday && !isSelected ? 'ring-1 ring-accent/50' : ''}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#2a2a2a] px-[22px] py-3">
          <button
            type="button"
            onClick={() => {
              const t = new Date();
              const iso = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
              onChange(iso);
              setOpen(false);
            }}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Today
          </button>
          <span className="text-[11px] text-text-muted/50 font-mono-custom">
            {MIN_YEAR} — {MAX_YEAR}
          </span>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-text-muted font-medium" style={{ fontSize: '13px', marginBottom: '10px', letterSpacing: '0.02em' }}>
        {label}
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        disabled={disabled}
        className={`w-full flex items-center justify-between text-left transition-all duration-200 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        } ${error ? 'border-red-500/70' : 'border-border hover:border-text-muted/30 focus:border-accent'}`}
        style={{
          padding: '1.25rem 1.75rem',
          fontSize: '15px',
          borderRadius: '1rem',
          background: 'var(--bg)',
          color: value ? 'var(--text-primary)' : 'rgba(113, 113, 122, 0.5)',
          borderWidth: '1px',
          borderStyle: 'solid',
          outline: 'none',
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarIcon className="w-5 h-5 flex-shrink-0" />
      </button>

      {error && (
        <p className="text-xs mt-2 flex items-center gap-1.5 animate-fade-in" style={{ color: '#fca5a5' }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}

      {popup}
    </div>
  );
}
