import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkAuth } from '@/lib/auth';

export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects ORDER BY created_at DESC
    `;
    // Fetch media for all projects
    const projectIds = projects.map((p: any) => p.id);
    if (projectIds.length > 0) {
      const media = await sql`
        SELECT * FROM project_media WHERE project_id = ANY(${projectIds}::uuid[])
        ORDER BY sort_order ASC
      `;
      const techs = await sql`
        SELECT pt.project_id, t.id, t.name, t.category, t.icon_slug
        FROM project_technologies pt
        JOIN technologies t ON t.id = pt.technology_id
        WHERE pt.project_id = ANY(${projectIds}::uuid[])
        ORDER BY t.name ASC
      `;
      const skills = await sql`
        SELECT ps.project_id, s.id, s.name, s.category, s.icon_slug
        FROM project_skills ps
        JOIN skills s ON s.id = ps.skill_id
        WHERE ps.project_id = ANY(${projectIds}::uuid[])
        ORDER BY s.name ASC
      `;
      // Attach media, technologies, and skills to each project
      return NextResponse.json(
        projects.map((p: any) => ({
          ...p,
          media: media.filter((m: any) => m.project_id === p.id),
          technologies: techs
            .filter((t: any) => t.project_id === p.id)
            .map(({ project_id, ...tech }: any) => tech),
          skills: skills
            .filter((s: any) => s.project_id === p.id)
            .map(({ project_id, ...skill }: any) => skill),
        }))
      );
    }
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Database unavailable' },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, image_url, project_url, video_url, timeframe_start, timeframe_end, media } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO projects (title, description, image_url, project_url, video_url, timeframe_start, timeframe_end)
      VALUES (${title.trim()}, ${description || ''}, ${image_url || ''}, ${project_url || ''}, ${video_url || ''}, ${timeframe_start || ''}, ${timeframe_end || ''})
      RETURNING *
    `;

    const project = result[0];

    // Insert media items if provided
    if (media && Array.isArray(media) && media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        await sql`
          INSERT INTO project_media (project_id, url, type, sort_order)
          VALUES (${project.id}, ${item.url || ''}, ${item.type || 'image'}, ${i})
        `;
      }
    }

    // Link technologies (existing ids + any created inline)
    const techIds: string[] = [...new Set<string>((body.technology_ids as string[]) || [])];
    if (Array.isArray(body.new_technologies)) {
      for (const nt of body.new_technologies) {
        if (!nt || !nt.name || !nt.name.trim()) continue;
        const existing = await sql`
          SELECT id FROM technologies WHERE LOWER(name) = LOWER(${nt.name.trim()}) LIMIT 1
        `;
        if (existing.length > 0) {
          techIds.push(existing[0].id);
          continue;
        }
        const created = await sql`
          INSERT INTO technologies (name, category, icon_slug)
          VALUES (${nt.name.trim()}, ${nt.category || ''}, ${nt.icon_slug || ''})
          RETURNING id
        `;
        techIds.push(created[0].id);
      }
    }
    for (const tid of techIds) {
      await sql`
        INSERT INTO project_technologies (project_id, technology_id)
        VALUES (${project.id}, ${tid})
        ON CONFLICT (project_id, technology_id) DO NOTHING
      `;
    }

    // Link skills (existing ids + any created inline)
    const skillIds: string[] = [...new Set<string>((body.skill_ids as string[]) || [])];
    if (Array.isArray(body.new_skills)) {
      for (const ns of body.new_skills) {
        if (!ns || !ns.name || !ns.name.trim()) continue;
        const existing = await sql`
          SELECT id FROM skills WHERE LOWER(name) = LOWER(${ns.name.trim()}) LIMIT 1
        `;
        if (existing.length > 0) {
          skillIds.push(existing[0].id);
          continue;
        }
        const created = await sql`
          INSERT INTO skills (name, category, icon_slug)
          VALUES (${ns.name.trim()}, ${ns.category || ''}, ${ns.icon_slug || ''})
          RETURNING id
        `;
        skillIds.push(created[0].id);
      }
    }
    for (const sid of skillIds) {
      await sql`
        INSERT INTO project_skills (project_id, skill_id)
        VALUES (${project.id}, ${sid})
        ON CONFLICT (project_id, skill_id) DO NOTHING
      `;
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Database unavailable' },
      { status: 503 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, image_url, project_url, video_url, timeframe_start, timeframe_end, media } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE projects
      SET 
        title = COALESCE(${title?.trim() || null}, title),
        description = COALESCE(${description || null}, description),
        image_url = COALESCE(${image_url || null}, image_url),
        project_url = COALESCE(${project_url || null}, project_url),
        video_url = COALESCE(${video_url || null}, video_url),
        timeframe_start = COALESCE(${timeframe_start || null}, timeframe_start),
        timeframe_end = COALESCE(${timeframe_end || null}, timeframe_end)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Replace media items if provided
    if (media && Array.isArray(media)) {
      await sql`DELETE FROM project_media WHERE project_id = ${id}`;
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        await sql`
          INSERT INTO project_media (project_id, url, type, sort_order)
          VALUES (${id}, ${item.url || ''}, ${item.type || 'image'}, ${i})
        `;
      }
    }

    // Replace technologies if provided (existing ids + any created inline)
    if (body.technology_ids || body.new_technologies) {
      await sql`DELETE FROM project_technologies WHERE project_id = ${id}`;
      const techIds: string[] = [...new Set<string>((body.technology_ids as string[]) || [])];
      if (Array.isArray(body.new_technologies)) {
        for (const nt of body.new_technologies) {
          if (!nt || !nt.name || !nt.name.trim()) continue;
          const created = await sql`
            INSERT INTO technologies (name, category, icon_slug)
            VALUES (${nt.name.trim()}, ${nt.category || ''}, ${nt.icon_slug || ''})
            RETURNING id
          `;
          techIds.push(created[0].id);
        }
      }
      for (const tid of techIds) {
        await sql`
          INSERT INTO project_technologies (project_id, technology_id)
          VALUES (${id}, ${tid})
          ON CONFLICT (project_id, technology_id) DO NOTHING
        `;
      }
    }

    // Replace skills if provided (existing ids + any created inline)
    if (body.skill_ids || body.new_skills) {
      await sql`DELETE FROM project_skills WHERE project_id = ${id}`;
      const skillIds: string[] = [...new Set<string>((body.skill_ids as string[]) || [])];
      if (Array.isArray(body.new_skills)) {
        for (const ns of body.new_skills) {
          if (!ns || !ns.name || !ns.name.trim()) continue;
          const created = await sql`
            INSERT INTO skills (name, category, icon_slug)
            VALUES (${ns.name.trim()}, ${ns.category || ''}, ${ns.icon_slug || ''})
            RETURNING id
          `;
          skillIds.push(created[0].id);
        }
      }
      for (const sid of skillIds) {
        await sql`
          INSERT INTO project_skills (project_id, skill_id)
          VALUES (${id}, ${sid})
          ON CONFLICT (project_id, skill_id) DO NOTHING
        `;
      }
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Database unavailable' },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Media is deleted via CASCADE
    const result = await sql`
      DELETE FROM projects WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Database unavailable' },
      { status: 503 }
    );
  }
}
