import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

function checkAuth(request: NextRequest) {
  if (request.method === 'GET') return true;
  const authHeader = request.headers.get('x-admin-key');
  return authHeader === ADMIN_PASSWORD;
}

export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects ORDER BY created_at DESC
    `;
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
    const { title, description, image_url, project_url, vc_url } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO projects (title, description, image_url, project_url, vc_url)
      VALUES (${title.trim()}, ${description || ''}, ${image_url || ''}, ${project_url || ''}, ${vc_url || ''})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
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
    const { id, title, description, image_url, project_url, vc_url } = body;

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
        vc_url = COALESCE(${vc_url || null}, vc_url)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
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
