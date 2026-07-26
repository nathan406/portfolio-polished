import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DB || process.env.DATABASE_URL;
const sql = neon(connectionString!);

function timeout(ms: number) {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Database timeout after ${ms}ms`)), ms)
  );
}

let dbInitialized = false;

export async function initDB() {
  if (dbInitialized) return true;
  try {
    await Promise.race([
      sql`
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
      `,
      timeout(5000),
    ]);

    await Promise.race([
      sql`
        CREATE TABLE IF NOT EXISTS project_media (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          url TEXT NOT NULL DEFAULT '',
          type TEXT NOT NULL DEFAULT 'image',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      timeout(5000),
    ]);

    await Promise.race([
      sql`
        CREATE TABLE IF NOT EXISTS technologies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT '',
          icon_slug TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      timeout(5000),
    ]);

    await Promise.race([
      sql`
        CREATE TABLE IF NOT EXISTS social_links (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          platform TEXT NOT NULL,
          url TEXT NOT NULL DEFAULT '',
          icon_slug TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      timeout(5000),
    ]);

    await Promise.race([
      sql`
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
      `,
      timeout(5000),
    ]);

    await Promise.race([
      sql`
        CREATE TABLE IF NOT EXISTS resume_education (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          degree TEXT NOT NULL,
          school TEXT NOT NULL DEFAULT '',
          description TEXT DEFAULT '',
          year_start TEXT NOT NULL DEFAULT '',
          year_end TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      timeout(5000),
    ]);

    await Promise.race([
      sql`
        CREATE TABLE IF NOT EXISTS site_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value JSONB NOT NULL DEFAULT '{}',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      timeout(5000),
    ]);

    dbInitialized = true;
    console.log('Database initialized');
    return true;
  } catch (error) {
    console.warn('Database not reachable — running in offline mode');
    return false;
  }
}

export async function queryProjects() {
  const dbReady = await initDB();
  if (!dbReady) return [];

  try {
    const result = await Promise.race([
      sql`SELECT * FROM projects ORDER BY created_at DESC`,
      timeout(5000),
    ]);
    return result as any[];
  } catch {
    return [];
  }
}

export default sql;
