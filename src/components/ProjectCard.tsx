import Link from 'next/link';
import { ClockIcon } from './icons';
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

export function ProjectCard({ project }: { project: Project }) {
  const thumbnailSrc = project.image_url || '/placeholder-thumbnail.svg';
  const timeframe = formatTimeframe(project);

  return (
    <Link href={`/project/${project.id}`} className="group block">
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-xl bg-surface-elevated mb-3">
        <img
          src={thumbnailSrc}
          alt={project.title}
          className="video-thumbnail transition-all duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/480x270/1E1E1E/6B7280?text=${encodeURIComponent(project.title.substring(0, 20))}`;
          }}
        />
        {/* Hover play overlay */}
        {project.video_url && (
          <div className="play-overlay absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="w-14 h-14 bg-accent/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/10">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-bg ml-0.5" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-accent-dim flex-shrink-0 flex items-center justify-center text-xs font-bold text-accent mt-0.5 border border-accent/20">
          N
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-5 mb-1 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-text-muted">
            Nathan Muyoba
          </p>
          {timeframe && (
            <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
              <ClockIcon className="w-3 h-3" />
              <span>{timeframe}</span>
            </div>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.technologies.slice(0, 4).map((t) => (
                <span
                  key={t.id}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                >
                  {t.name}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="text-[10px] text-text-muted px-1 py-0.5">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
