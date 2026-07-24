'use client';

import { ChannelNav } from './ChannelNav';
import type { TabId } from './ChannelNav';

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
      <div className="w-full mx-auto" style={{ paddingLeft: '5%', paddingRight: '5%', maxWidth: '1000px' }}>
        {/* Minimal hero skeleton */}
        <div className="flex items-center gap-6">
          <ShimmerBlock className="w-16 h-16 rounded-full bg-[#1A1A1A] flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <ShimmerBlock className="h-9 bg-[#1A1A1A] rounded-md w-[260px]" />
            <ShimmerBlock className="h-4 bg-[#1A1A1A] rounded-md w-[180px]" />
            <ShimmerBlock className="h-4 bg-[#1A1A1A] rounded-md w-[320px]" />
          </div>
        </div>

        {/* Nav tabs skeleton */}
        <div className="border-b border-[#1E1E1E]" style={{ marginTop: 'clamp(60px, 7vh, 100px)' }}>
          <div className="flex gap-10">
            {['Projects', 'About', 'Resume'].map((tab) => (
              <ShimmerBlock
                key={tab}
                className="h-8 bg-[#1A1A1A] rounded-md mb-4"
                style={{ width: tab === 'Projects' ? '100px' : tab === 'About' ? '80px' : '90px' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ChannelBanner({
  activeTab,
  onTabChange,
  loading = false,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  loading?: boolean;
}) {
  if (loading) {
    return <ChannelBannerLoadingSkeleton />;
  }

  return (
    <section className="animate-fade-in" style={{ paddingTop: 'clamp(80px, 10vh, 120px)' }}>
      <div className="w-full mx-auto" style={{ paddingLeft: '5%', paddingRight: '5%', maxWidth: '1000px' }}>
        {/* Minimal hero */}
        <div className="flex items-center gap-6">
          {/* Small profile image — like a signature stamp */}
          <div className="w-16 h-16 rounded-full bg-accent flex-shrink-0 overflow-hidden shadow-lg ring-2 ring-accent/20">
            <img
              src="https://placehold.co/64x64/DC2626/0A0A0A?text=N"
              alt="Nathan Muyoba"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight leading-tight">
              Nathan Muyoba
            </h1>
            <p className="text-text-secondary text-sm sm:text-base mt-1">
              Fullstack Developer
            </p>
            <p className="text-text-muted text-sm mt-1 max-w-[480px]">
              Building accessible, performant web applications from scratch.
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
