import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import type { Project, Technology } from '@/lib/types';
import { ProjectDetailClient } from '@/components/ProjectDetailClient';

async function getProject(id: string): Promise<Project | null> {
  try {
    const result = await sql`
      SELECT * FROM projects WHERE id = ${id}
    `;
    const project = (result as Project[])[0] || null;
    if (!project) return null;

    // Attach technologies used in this project
    const techs = await sql`
      SELECT t.id, t.name, t.category, t.icon_slug
      FROM project_technologies pt
      JOIN technologies t ON t.id = pt.technology_id
      WHERE pt.project_id = ${id}
      ORDER BY t.name ASC
    `;

    return { ...project, technologies: techs as Technology[] } as Project;
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

async function getProfileImageUrl(): Promise<string> {
  try {
    const result = await sql`
      SELECT value FROM site_settings WHERE key = 'site_settings' LIMIT 1
    `;
    const value = (result[0] as { value?: Record<string, unknown> })?.value;
    return typeof value?.profile_image_url === 'string' ? value.profile_image_url : '';
  } catch {
    return '';
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, otherProjects, profileImageUrl] = await Promise.all([
    getProject(id),
    getOtherProjects(id),
    getProfileImageUrl(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <ProjectDetailClient
      project={project}
      otherProjects={otherProjects}
      profileImageUrl={profileImageUrl}
    />
  );
}
