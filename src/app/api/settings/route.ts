import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { checkAuth } from '@/lib/auth';

const DEFAULT_SETTINGS = {
  bio: 'Building accessible, performant web applications from scratch.',
  subtitle: 'Fullstack Developer',
  about_paragraphs: [
    'I build fullstack applications that are accessible, performant, and a pleasure to use. Every project starts with a clear understanding of the problem and ends with clean, maintainable code.',
    'I care about details — the way a button feels on hover, how a page loads on a slow connection, whether the colour palette works for someone with colour vision deficiency. These aren\'t polish; they\'re fundamentals that separate working software from great software.',
    'Outside of code I read about distributed systems, contribute to open-source projects, and occasionally write about the engineering decisions that keep me up at night.',
  ],
  stats: [
    { value: '3+', label: 'Years building' },
    { value: '20+', label: 'Projects shipped' },
    { value: '10+', label: 'Clients worked with' },
    { value: '100%', label: 'Commitment to craft' },
  ],
  resume_intro: 'Everything about my experience, education, and technical background in one document. I\'m always open to a conversation about interesting work.',
  resume_pdf_url: '',
};

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM site_settings WHERE key = 'site_settings' LIMIT 1
    `;
    if (result.length > 0) {
      return NextResponse.json({ ...DEFAULT_SETTINGS, ...result[0].value as any });
    }
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const value = {
      bio: body.bio || DEFAULT_SETTINGS.bio,
      subtitle: body.subtitle || DEFAULT_SETTINGS.subtitle,
      about_paragraphs: body.about_paragraphs || DEFAULT_SETTINGS.about_paragraphs,
      stats: body.stats || DEFAULT_SETTINGS.stats,
      resume_intro: body.resume_intro || DEFAULT_SETTINGS.resume_intro,
      resume_pdf_url: body.resume_pdf_url || '',
    };

    const result = await sql`
      INSERT INTO site_settings (key, value)
      VALUES ('site_settings', ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (key)
      DO UPDATE SET value = ${JSON.stringify(value)}::jsonb, updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json(value);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
