'use client';

import { ChannelNav } from './ChannelNav';
import type { TabId } from './ChannelNav';
import type { SocialLink } from '@/lib/types';

function ShimmerBlock({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div className={`${className} relative overflow-hidden`} style={style}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DC2626]/[0.04] to-transparent animate-shimmer" />
    </div>
  );
}

function ChannelBannerLoadingSkeleton() {
  return (
    <section className="animate-fade-in" style={{ paddingTop: 'clamp(80px, 10vh, 120px)' }}>
      <div className="w-full mx-auto" style={{ paddingLeft: '5%', paddingRight: '5%', maxWidth: '1240px' }}>
        {/* Minimal hero skeleton */}
        <div className="flex items-center gap-6">
          <ShimmerBlock className="w-16 h-16 rounded-full bg-[#1A1A1A] flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <ShimmerBlock className="h-9 bg-[#1A1A1A] rounded-md w-[260px]" />
            <ShimmerBlock className="h-4 bg-[#1A1A1A] rounded-md w-[180px]" />
            <ShimmerBlock className="h-4 bg-[#1A1A1A] rounded-md w-[280px]" />
            <ShimmerBlock className="h-4 bg-[#1A1A1A] rounded-md w-[340px]" />
          </div>
        </div>

        {/* Nav tabs skeleton */}
        <div className="border-b border-[#1E1E1E]" style={{ marginTop: 'clamp(60px, 7vh, 100px)' }}>
          <div className="flex gap-10">
            {['Projects', 'About', 'Experience', 'Resume'].map((tab) => (
              <ShimmerBlock
                key={tab}
                className="h-8 bg-[#1A1A1A] rounded-md mb-4"
                style={{ width: tab === 'Projects' ? '100px' : tab === 'About' ? '80px' : tab === 'Experience' ? '110px' : '90px' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Small inline icons (reasonable size) ── */

function MailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* ── Helpers ── */

// WhatsApp URLs look like https://wa.me/260978535360 or https://wa.me/+260978535360
function formatWhatsAppNumber(url: string): string {
  const m = url.match(/wa\.me\/([+\d\s-]+)/i);
  if (!m) return 'WhatsApp';
  const digits = m[1].replace(/\D/g, '');
  // +260 978 535 360
  if (digits.length === 12 && digits.startsWith('260')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return digits ? `+${digits}` : 'WhatsApp';
}

export function ChannelBanner({
  activeTab,
  onTabChange,
  loading = false,
  subtitle,
  bio,
  profileImageUrl = '',
  socials = [],
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  loading?: boolean;
  subtitle?: string;
  bio?: string;
  profileImageUrl?: string;
  socials?: SocialLink[];
}) {
  if (loading) {
    return <ChannelBannerLoadingSkeleton />;
  }

  // Email is displayed as plain text (NOT a link). WhatsApp opens a chat.
  const emailSocial = socials.find((s) => /email|gmail|mail/i.test(s.platform) || /@/.test(s.url));
  const waSocial = socials.find((s) => /whatsapp|wa\.me/i.test(s.platform) || /wa\.me/i.test(s.url));

  const email = emailSocial?.url?.replace(/^mailto:/i, '').trim() || 'nathanmuyoba@gmail.com';
  const waUrl = waSocial?.url || 'https://wa.me/260978535360';
  const waNumber = formatWhatsAppNumber(waUrl);

  return (
    <section className="animate-fade-in" style={{ paddingTop: 'clamp(80px, 10vh, 120px)' }}>
      <div className="w-full mx-auto" style={{ paddingLeft: '5%', paddingRight: '5%', maxWidth: '1240px' }}>
        {/* Minimal hero */}
        <div className="flex items-center gap-6">
          {/* Small profile image — like a signature stamp */}
          <div className="w-16 h-16 rounded-full bg-accent flex-shrink-0 overflow-hidden shadow-lg ring-2 ring-accent/20">
            <img
              src={profileImageUrl || 'https://placehold.co/64x64/DC2626/0A0A0A?text=N'}
              alt="Nathan Muyoba"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== 'https://placehold.co/64x64/DC2626/0A0A0A?text=N') {
                  target.src = 'https://placehold.co/64x64/DC2626/0A0A0A?text=N';
                }
              }}
            />
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight leading-tight">
              Nathan Muyoba
            </h1>
            <p className="text-text-secondary text-sm sm:text-base mt-1">
              {subtitle || 'Fullstack AI Engineer'}
            </p>

            {/* Connect — email as text, whatsapp opens chat */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-[13px] sm:text-sm text-text-muted">
                <MailIcon className="w-4 h-4 text-accent/70" />
                {email}
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] sm:text-sm text-text-muted hover:text-accent transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-accent/70" />
                {waNumber}
              </a>
            </div>

            <p className="text-text-muted text-sm mt-2 max-w-[480px]">
              {bio || 'Building accessible, performant web applications from scratch.'}
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="border-b border-border" style={{ marginTop: 'clamp(60px, 7vh, 100px)' }}>
          <ChannelNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>
    </section>
  );
}
