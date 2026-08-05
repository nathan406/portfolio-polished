'use client';

import Link from 'next/link';
import { ExternalLinkIcon, PlayIcon, ChevronRight, ClockIcon } from './icons';
import type { Project } from '@/lib/types';

function formatTimeframe(project: Project) {
  if (project.timeframe_start && project.timeframe_end) {
    return `${project.timeframe_start} — ${project.timeframe_end}`;
  }
  if (project.timeframe_start) {
    return `From ${project.timeframe_start}`;
  }
  return '';
}

export function ProjectDetailClient({
  project,
  otherProjects,
  profileImageUrl = '',
}: {
  project: Project;
  otherProjects: Project[];
  profileImageUrl?: string;
}) {
  const timeframe = formatTimeframe(project);

  return (
    <div className="min-h-screen bg-bg">
      {/* Minimal top bar — back to the homepage */}
      <div
        className="mx-auto pt-14"
        style={{ maxWidth: '1800px', paddingLeft: 'clamp(20px, 5vw, 96px)', paddingRight: 'clamp(20px, 5vw, 96px)' }}
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-3.5 text-[15px] font-medium text-text-muted hover:text-accent transition-colors duration-300 py-1.5"
        >
          <span className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-surface group-hover:border-accent/40 group-hover:bg-accent-dim group-hover:scale-105 transition-all duration-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </span>
          Back
        </Link>
      </div>

      <div
        className="mx-auto pt-10 pb-16"
        style={{ maxWidth: '1800px', paddingLeft: 'clamp(20px, 5vw, 96px)', paddingRight: 'clamp(20px, 5vw, 96px)' }}
      >
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-16">
          {/* Main Content — centered readable column */}
          <div className="flex-1 min-w-0">
            <div className="mx-auto w-full" style={{ maxWidth: '960px' }}>
            {/* Player */}
            <div className="relative bg-surface rounded-2xl overflow-hidden border border-accent-border aspect-video">
              {project.video_url ? (
                <iframe
                  src={project.video_url}
                  title={project.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : project.project_url ? (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group h-full"
                >
                  <img
                    src={project.image_url || 'https://placehold.co/1280x720/272727/555?text=Project'}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/1280x720/1E1E1E/6B7280?text=${encodeURIComponent(project.title.substring(0, 30))}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-20 h-20 bg-accent/80 rounded-full flex items-center justify-center shadow-lg shadow-accent/10 transform group-hover:scale-110 transition-transform">
                      <PlayIcon className="w-10 h-10 text-bg ml-1" />
                    </div>
                  </div>
                </a>
              ) : (
                <img
                  src={project.image_url || 'https://placehold.co/1280x720/272727/555?text=Project'}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-tight mt-14">
              {project.title}
            </h1>

            {/* Meta + Actions row */}
            <div className="flex flex-wrap items-center justify-between gap-6 mt-10">
              <div className="flex items-center gap-4">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Nathan Muyoba"
                    className="w-12 h-12 rounded-full object-cover border border-accent/20 flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/96x96/DC2626/0A0A0A?text=N';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent-dim flex items-center justify-center text-sm font-bold text-accent border border-accent/20 flex-shrink-0">
                    N
                  </div>
                )}
                <div>
                  <p className="text-[15px] font-semibold text-text-primary">
                    Nathan Muyoba
                  </p>
                  {timeframe && (
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                      <ClockIcon className="w-3 h-3" />
                      {timeframe}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                {project.project_url && (
                  <Link
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-accent to-accent-hover text-white text-[15px] font-bold rounded-full transition-all duration-300 active:scale-[0.97] overflow-hidden shadow-[0_20px_25px_-5px_rgba(220,38,38,0.3),0_8px_10px_-6px_rgba(220,38,38,0.25)] hover:shadow-[0_25px_35px_-5px_rgba(220,38,38,0.45),0_10px_15px_-6px_rgba(220,38,38,0.4)]"
                    style={{ padding: '1.1rem 2.75rem' }}
                  >
                    <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                    <ExternalLinkIcon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Visit Project</span>
                    <span className="relative z-10 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </Link>
                )}
                {project.video_url && (
                  <Link
                    href={project.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-surface border border-border text-text-secondary text-sm font-semibold rounded-full hover:text-accent hover:border-accent/40 transition-all duration-300 active:scale-[0.97]"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Watch Video
                  </Link>
                )}
              </div>
            </div>

            {/* Description — 2.5% below the name row, 1% padding */}
            <div
              className="bg-surface border border-accent-border rounded-2xl"
              style={{ marginTop: 'clamp(16px, 2.5vw, 56px)', padding: 'clamp(16px, 1vw, 32px)' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono-custom text-xs text-accent/70 tracking-wide select-none">{'// ──'}</span>
                <span className="font-mono-custom text-xs text-text-muted uppercase" style={{ letterSpacing: '0.15em' }}>
                  Description
                </span>
              </div>
              <p className="text-text-secondary text-base sm:text-[17px] leading-[2] whitespace-pre-wrap">
                {project.description || 'No description provided.'}
              </p>
            </div>

            {/* Technologies — 2.5% above; 5% below only when it's the last block */}
            {project.technologies && project.technologies.length > 0 && (
              <div style={{ marginTop: 'clamp(16px, 2.5vw, 56px)', marginBottom: project.skills && project.skills.length > 0 ? 'clamp(16px, 2.5vw, 56px)' : 'clamp(48px, 5vw, 120px)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono-custom text-xs text-accent/70 tracking-wide select-none">{'// ──'}</span>
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-text-primary tracking-tight">
                    Built with
                  </h2>
                </div>
                <div className="rounded-2xl bg-surface border border-border" style={{ padding: 'clamp(20px, 3vw, 48px)' }}>
                  <div className="flex flex-wrap gap-2.5">
                    {project.technologies.map((t) => (
                      <span
                        key={t.id}
                        className="text-sm font-semibold rounded-full bg-accent/15 text-text-primary border border-accent/30 hover:bg-accent/25 transition-colors duration-200"
                        style={{ padding: 'clamp(10px, 1vw, 20px)' }}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Skills — 2.5% above, at least 5% below */}
            {project.skills && project.skills.length > 0 && (
              <div style={{ marginTop: 'clamp(16px, 2.5vw, 56px)', marginBottom: 'clamp(48px, 5vw, 120px)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono-custom text-xs text-accent/70 tracking-wide select-none">{'// ──'}</span>
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-text-primary tracking-tight">
                    Skills
                  </h2>
                </div>
                <div className="rounded-2xl bg-surface border border-border" style={{ padding: 'clamp(20px, 3vw, 48px)' }}>
                  <div className="flex flex-wrap gap-2.5">
                    {project.skills.map((s) => (
                      <span
                        key={s.id}
                        className="text-sm font-semibold rounded-full bg-surface-elevated text-text-secondary border border-border hover:border-accent/40 hover:text-text-primary transition-colors duration-200"
                        style={{ padding: 'clamp(10px, 1vw, 20px)' }}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Sidebar - More Projects — 5% from the right edge */}
          {otherProjects.length > 0 && (
            <aside className="w-full lg:w-[380px] flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-text-primary tracking-tight">
                  More Projects
                </h2>
                <Link
                  href="/"
                  className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  View all
                </Link>
              </div>

              <div className="flex flex-col gap-6">
                {otherProjects.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-[150px] h-[84px] flex-shrink-0 rounded-lg overflow-hidden bg-surface-elevated border border-border">
                      <img
                        src={p.image_url || 'https://placehold.co/150x84/1E1E1E/6B7280?text=Project'}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/150x84/1E1E1E/6B7280?text=${encodeURIComponent(p.title.substring(0, 15))}`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1.5">
                        {p.timeframe_start && p.timeframe_end
                          ? `${p.timeframe_start} — ${p.timeframe_end}`
                          : new Date(p.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 mt-8 py-3.5 text-sm font-medium text-text-muted hover:text-text-secondary hover:bg-surface rounded-xl border border-border transition-all duration-300"
              >
                <span>Back to all projects</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
