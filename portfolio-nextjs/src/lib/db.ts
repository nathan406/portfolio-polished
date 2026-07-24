import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DB || process.env.DATABASE_URL;
const sql = neon(connectionString!);

function timeout(ms: number) {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Database timeout after ${ms}ms`)), ms)
  );
}

export async function initDB() {
  try {
    await Promise.race([
      sql`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          image_url TEXT NOT NULL DEFAULT '',
          project_url TEXT NOT NULL DEFAULT '',
          vc_url TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      timeout(5000),
    ]);
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
