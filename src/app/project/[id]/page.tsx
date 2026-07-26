import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import type { Project } from '@/lib/types';
import { ProjectDetailClient } from '@/components/ProjectDetailClient';

async function getProject(id: string): Promise<Project | null> {
  try {
    const result = await sql`
      SELECT * FROM projects WHERE id = ${id}
    `;
    return (result as Project[])[0] || null;
  } catch {
    return null;
  }
}

async function getOtherProjects(id: string): Promise<Project[]> {
  try {
    const result = await sql`
      SELECT * FROM projects WHERE id != ${id} ORDER BY created_at DESC LIMIT 12
    `;
    return result as Project[];
  } catch {
    return [];
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, otherProjects] = await Promise.all([
    getProject(id),
    getOtherProjects(id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <ProjectDetailClient project={project} otherProjects={otherProjects} />
  );
}
