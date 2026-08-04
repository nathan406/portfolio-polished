import { ProjectCard } from './ProjectCard';
import type { Project } from '@/lib/types';

export function ProjectGrid({ projects, compact = false }: { projects: Project[]; compact?: boolean }) {
  if (projects.length === 0) {
    return (
      <div className="text-center" style={{ paddingTop: 'clamp(80px, 10vh, 160px)', paddingBottom: 'clamp(80px, 10vh, 160px)' }}>
        <h3 className="text-lg font-medium text-text-muted">No projects yet</h3>
        <p className="text-sm text-text-muted mt-2">Projects will appear here once added</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-x-6 gap-y-10 ${compact ? 'grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
