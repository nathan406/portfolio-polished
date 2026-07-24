'use client';

const TABS = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Resume' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export function ChannelNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex items-center gap-8 sm:gap-10 lg:gap-12">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative py-4 text-sm sm:text-[15px] font-medium tracking-wide whitespace-nowrap
              transition-all duration-300 ease-out
              ${isActive 
                ? 'text-accent' 
                : 'text-text-muted hover:text-accent/70'
              }
            `}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
