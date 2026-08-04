'use client';

import Link from 'next/link';
import { ExternalLinkIcon, PlayIcon, ChevronRight } from './icons';
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
}: {
  project: Project;
  otherProjects: Project[];
}) {
  const timeframe = formatTimeframe(project);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1100px] mx-auto px-5 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Media gallery - video or image */}
            <div className="relative bg-surface rounded-xl overflow-hidden border border-border">
              {project.video_url ? (
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={project.video_url}
                    title={project.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : project.project_url ? (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group"
                >
                  <img
                    src={project.image_url || 'https://placehold.co/1280x720/272727/555?text=Project'}
                    alt={project.title}
                    className="w-full aspect-video object-cover"
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
                  className="w-full aspect-video object-cover"
                />
              )}
            </div>

            {/* Project Info */}
            <div className="mt-6">
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                {/* Meta */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-dim flex items-center justify-center text-sm font-bold text-accent border border-accent/20 flex-shrink-0">
                    N
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Nathan Muyoba
                    </p>
                    {timeframe && (
                      <p className="text-xs text-text-muted">
                        {timeframe}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {project.project_url && (
                    <Link
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg text-sm font-semibold rounded-full hover:bg-accent-hover transition-all duration-300 active:scale-[0.97]"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      Visit Project
                    </Link>
                  )}
                  {project.video_url && (
                    <Link
                      href={project.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-secondary text-sm font-medium rounded-full hover:text-accent hover:border-accent/30 transition-all duration-300"
                    >
                      <PlayIcon className="w-4 h-4" />
                      Watch Video
                    </Link>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 bg-surface border border-border rounded-xl p-5">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-medium text-text-muted mb-3" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Built with
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t) => (
                      <span
                        key={t.id}
                        className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-surface border border-border text-text-secondary"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - More Projects */}
          {otherProjects.length > 0 && (
            <aside className="w-full lg:w-[380px] flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-base font-semibold text-text-primary">More Projects</h2>
                <Link href="/" className="text-xs text-accent hover:text-accent-hover transition-colors">
                  View all
                </Link>
              </div>
              <div className="flex flex-col gap-5">
                {otherProjects.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-[140px] h-[79px] flex-shrink-0 rounded-lg overflow-hidden bg-surface-elevated">
                      <img
                        src={p.image_url || 'https://placehold.co/140x79/1E1E1E/6B7280?text=Project'}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/140x79/1E1E1E/6B7280?text=${encodeURIComponent(p.title.substring(0, 15))}`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-5 group-hover:text-accent transition-colors">
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

              {otherProjects.length > 6 && (
                <Link
                  href="/"
                  className="flex items-center justify-center gap-1 mt-5 py-3 text-sm text-text-muted hover:text-text-secondary hover:bg-surface rounded-xl transition-all duration-300"
                >
                  <span>Show more</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
