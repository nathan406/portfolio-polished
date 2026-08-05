import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkAuth } from '@/lib/auth';

export async function GET() {
  try {
    const experience = await sql`
      SELECT * FROM resume_experience ORDER BY sort_order ASC, created_at DESC
    `;
    const education = await sql`
      SELECT * FROM resume_education ORDER BY year_start DESC
    `;
    return NextResponse.json({ experience, education });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json({ experience: [], education: [] }, { status: 503 });
  }
}

/* ── Experience Endpoints ── */

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, company, description, year_start, year_end, type } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (type === 'education') {
      const result = await sql`
        INSERT INTO resume_education (degree, school, description, year_start, year_end)
        VALUES (${title.trim()}, ${company || ''}, ${description || ''}, ${year_start || ''}, ${year_end || ''})
        RETURNING *
      `;
      return NextResponse.json({ ...result[0], _type: 'education' }, { status: 201 });
    }

    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM resume_experience`;
    const sortOrder = maxOrder[0]?.next || 0;

    const result = await sql`
      INSERT INTO resume_experience (title, company, description, year_start, year_end, sort_order)
      VALUES (${title.trim()}, ${company || ''}, ${description || ''}, ${year_start || ''}, ${year_end || ''}, ${sortOrder})
      RETURNING *
    `;

    return NextResponse.json({ ...result[0], _type: 'experience' }, { status: 201 });
  } catch (error) {
    console.error('Error creating resume entry:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, company, description, year_start, year_end, type, sort_order } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'education') {
      const result = await sql`
        UPDATE resume_education
        SET
          degree = COALESCE(${title?.trim() || null}, degree),
          school = COALESCE(${company || null}, school),
          description = COALESCE(${description || null}, description),
          year_start = COALESCE(${year_start || null}, year_start),
          year_end = COALESCE(${year_end || null}, year_end)
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json({ ...result[0], _type: 'education' });
    }

    const result = await sql`
      UPDATE resume_experience
      SET
        title = COALESCE(${title?.trim() || null}, title),
        company = COALESCE(${company || null}, company),
        description = COALESCE(${description || null}, description),
        year_start = COALESCE(${year_start || null}, year_start),
        year_end = COALESCE(${year_end || null}, year_end),
        sort_order = COALESCE(${sort_order !== undefined ? sort_order : null}::integer, sort_order)
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ ...result[0], _type: 'experience' });
  } catch (error) {
    console.error('Error updating resume entry:', error);
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
    const type = searchParams.get('type');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'education') {
      await sql`DELETE FROM resume_education WHERE id = ${id}`;
    } else {
      await sql`DELETE FROM resume_experience WHERE id = ${id}`;
    }
    return NextResponse.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting resume entry:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
