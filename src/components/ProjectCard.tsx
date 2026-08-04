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
      <div className="relative overflow-hidden rounded-xl bg-surface-elevated mb-4 aspect-video">
        <img
          src={thumbnailSrc}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
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

      {/* Title */}
      <h3 className="font-display text-base sm:text-[17px] font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors duration-300 pr-1">
        {project.title}
      </h3>

      {/* Duration */}
      {timeframe && (
        <div className="flex items-center gap-1.5 text-sm text-text-muted mt-2 group-hover:text-text-secondary transition-colors duration-300">
          <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{timeframe}</span>
        </div>
      )}
    </Link>
  );
}
