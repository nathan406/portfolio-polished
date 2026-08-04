import { neon } from '@neondatabase/serverless';

// Lazy client — only connects when first query is run.
// This allows the app to build/start without a DB connection string configured.
let _client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (!_client) {
    const connStr = process.env.NEON_DB || process.env.DATABASE_URL;
    if (!connStr) {
      throw new Error(
        'Database connection string not configured. ' +
        'Set the NEON_DB or DATABASE_URL environment variable.'
      );
    }
    _client = neon(connStr);
  }
  return _client;
}

// Wraps the Neon tagged-template client with lazy init + correct typing.
// Tagged template `sql\`…\`` calls this function automatically.
export default function sql(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  return getClient()(strings, ...values) as Promise<any[]>;
}

/**
 * One-time migration: creates all required tables if they don't exist.
 * Call this from a setup endpoint (e.g. /api/migrate) — NOT from API routes.
 */
export async function runMigration(): Promise<boolean> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL DEFAULT '',
        project_url TEXT NOT NULL DEFAULT '',
        video_url TEXT NOT NULL DEFAULT '',
        timeframe_start TEXT NOT NULL DEFAULT '',
        timeframe_end TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS project_media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        url TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'image',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS technologies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        icon_slug TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT NOT NULL,
        url TEXT NOT NULL DEFAULT '',
        icon_slug TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS resume_experience (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        company TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        year_start TEXT NOT NULL DEFAULT '',
        year_end TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS resume_education (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        degree TEXT NOT NULL,
        school TEXT NOT NULL DEFAULT '',
        description TEXT DEFAULT '',
        year_start TEXT NOT NULL DEFAULT '',
        year_end TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

