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
      // Attach media to each project
      return NextResponse.json(
        projects.map((p: any) => ({
          ...p,
          media: media.filter((m: any) => m.project_id === p.id),
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
