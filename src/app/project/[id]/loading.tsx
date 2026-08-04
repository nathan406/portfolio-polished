function Shimmer({ className }: { className: string }) {
  return (
    <div className={`${className} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DC2626]/[0.05] to-transparent animate-shimmer" />
    </div>
  );
}

export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div
        className="mx-auto pt-14 pb-16"
        style={{ maxWidth: '1800px', paddingLeft: 'clamp(20px, 5vw, 96px)', paddingRight: 'clamp(20px, 5vw, 96px)' }}
      >
        {/* Back button skeleton */}
        <Shimmer className="w-24 h-10 rounded-full bg-surface mb-12" />

        <div className="flex flex-col lg:flex-row gap-14 lg:gap-16">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            <div className="mx-auto w-full" style={{ maxWidth: '960px' }}>
              {/* Player */}
              <Shimmer className="w-full aspect-video bg-surface rounded-2xl" />

              {/* Title */}
              <Shimmer className="h-9 bg-surface rounded-lg w-[60%] mt-14" />

              {/* Meta row */}
              <div className="flex flex-wrap items-center justify-between gap-6 mt-10">
                <div className="flex items-center gap-4">
                  <Shimmer className="w-12 h-12 rounded-full bg-surface flex-shrink-0" />
                  <div className="space-y-2.5">
                    <Shimmer className="h-4 bg-surface rounded w-32" />
                    <Shimmer className="h-3 bg-surface rounded w-24" />
                  </div>
                </div>
                <Shimmer className="h-12 rounded-full bg-surface w-48" />
              </div>

              {/* Description */}
              <div style={{ marginTop: 'clamp(16px, 2.5vw, 56px)' }}>
                <Shimmer className="h-48 bg-surface rounded-2xl" />
              </div>

              {/* Built with */}
              <div style={{ marginTop: 'clamp(16px, 2.5vw, 56px)', marginBottom: 'clamp(48px, 5vw, 120px)' }}>
                <Shimmer className="h-32 bg-surface rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[380px] flex-shrink-0">
            <Shimmer className="h-5 bg-surface rounded w-36 mb-8" />
            <div className="flex flex-col gap-7">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3.5">
                  <Shimmer className="w-[150px] h-[84px] rounded-lg bg-surface flex-shrink-0" />
                  <div className="flex-1 space-y-2.5 pt-0.5">
                    <Shimmer className="h-4 bg-surface rounded w-[80%]" />
                    <Shimmer className="h-3 bg-surface rounded w-[55%]" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
