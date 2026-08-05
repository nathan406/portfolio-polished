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

// Direct Neon tagged-template client — used internally so the lazy migration
// below can run without re-entering itself.
function rawSql(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  return getClient()(strings, ...values) as Promise<any[]>;
}

// Lazy migration guard: on the very first database query after a cold start,
// missing tables are created automatically (all statements are idempotent).
// This means a fresh database works without any manual setup step.
let migrationDone = false;
let migrationInFlight: Promise<void> | null = null;

// Wraps the Neon tagged-template client with lazy init + correct typing.
// Tagged template `sql\`…\`` calls this function automatically.
export default function sql(
  strings: TemplateStringsArray,
  ...values: any[]
) {
  if (!migrationDone) {
    if (!migrationInFlight) {
      migrationInFlight = (async () => {
        try {
          migrationDone = await runMigration();
        } finally {
          // Always reset the flag (even if the migration ever throws), so the
          // next query can retry instead of being stuck on a failed promise.
          migrationInFlight = null;
        }
      })();
    }
    return migrationInFlight.then(() =>
      getClient()(strings, ...values) as Promise<any[]>
    );
  }
  return getClient()(strings, ...values) as Promise<any[]>;
}

/**
 * Migration: creates all required tables if they don't exist.
 * Runs automatically on the first query of each cold start (see `sql` above)
 * and can also be triggered manually via POST /api/migrate.
 */
export async function runMigration(): Promise<boolean> {
  try {
    await rawSql`
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

    await rawSql`
      CREATE TABLE IF NOT EXISTS project_media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        url TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'image',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await rawSql`
      CREATE TABLE IF NOT EXISTS technologies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        icon_slug TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await rawSql`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        icon_slug TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await rawSql`
      CREATE TABLE IF NOT EXISTS social_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT NOT NULL,
        url TEXT NOT NULL DEFAULT '',
        icon_slug TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await rawSql`
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

    await rawSql`
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

    await rawSql`
      CREATE TABLE IF NOT EXISTS project_technologies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (project_id, technology_id)
      );
    `;

    await rawSql`
      CREATE TABLE IF NOT EXISTS project_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (project_id, skill_id)
      );
    `;

    await rawSql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // ── Upgrade existing tables ─────────────────────────────────────────────
    // CREATE TABLE IF NOT EXISTS skips tables that already exist, so older
    // databases may be missing columns the current code expects. Add every
    // column with ADD COLUMN IF NOT EXISTS to bring old schemas up to date.
    await rawSql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS timeframe_start TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS timeframe_end TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_url TEXT NOT NULL DEFAULT ''`;

    await rawSql`ALTER TABLE project_media ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE project_media ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'image'`;
    await rawSql`ALTER TABLE project_media ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`;

    await rawSql`ALTER TABLE technologies ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE technologies ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE technologies ADD COLUMN IF NOT EXISTS icon_slug TEXT NOT NULL DEFAULT ''`;

    await rawSql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS icon_slug TEXT NOT NULL DEFAULT ''`;

    await rawSql`ALTER TABLE social_links ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE social_links ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE social_links ADD COLUMN IF NOT EXISTS icon_slug TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE social_links ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`;

    await rawSql`ALTER TABLE resume_experience ADD COLUMN IF NOT EXISTS company TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE resume_experience ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE resume_experience ADD COLUMN IF NOT EXISTS year_start TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE resume_experience ADD COLUMN IF NOT EXISTS year_end TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE resume_experience ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`;

    await rawSql`ALTER TABLE resume_education ADD COLUMN IF NOT EXISTS school TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE resume_education ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''`;
    await rawSql`ALTER TABLE resume_education ADD COLUMN IF NOT EXISTS year_start TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE resume_education ADD COLUMN IF NOT EXISTS year_end TEXT NOT NULL DEFAULT ''`;

    await rawSql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS key TEXT NOT NULL DEFAULT ''`;
    await rawSql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS value JSONB NOT NULL DEFAULT '{}'`;
    await rawSql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`;

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

