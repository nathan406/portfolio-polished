import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkAuth } from '@/lib/auth';

export async function GET() {
  try {
    const socials = await sql`
      SELECT * FROM social_links ORDER BY sort_order ASC, platform ASC
    `;
    return NextResponse.json(socials);
  } catch (error) {
    console.error('Error fetching socials:', error);
    return NextResponse.json([], { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { platform, url, icon_slug } = body;

    if (!platform || !platform.trim()) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    // Get max sort_order
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM social_links`;
    const sortOrder = maxOrder[0]?.next || 0;

    const result = await sql`
      INSERT INTO social_links (platform, url, icon_slug, sort_order)
      VALUES (${platform.trim()}, ${url || ''}, ${icon_slug || ''}, ${sortOrder})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating social link:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, platform, url, icon_slug, sort_order } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE social_links
      SET
        platform = COALESCE(${platform?.trim() || null}, platform),
        url = COALESCE(${url || null}, url),
        icon_slug = COALESCE(${icon_slug || null}, icon_slug),
        sort_order = COALESCE(${sort_order !== undefined ? sort_order : null}::integer, sort_order)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating social link:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM social_links WHERE id = ${id}`;
    return NextResponse.json({ message: 'Social link deleted' });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
