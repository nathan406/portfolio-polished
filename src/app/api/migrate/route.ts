import { NextResponse } from 'next/server';
import { runMigration } from '@/lib/db';
import { checkAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

/**
 * POST /api/migrate
 *
 * One-time setup endpoint. Creates all database tables if they don't exist.
 * Requires admin authentication (x-admin-key header).
 *
 * Call this once after deploying to initialize your database.
 */
export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const success = await runMigration();
    if (success) {
      return NextResponse.json({
        message: 'Migration completed successfully. All tables are ready.',
      });
    }
    return NextResponse.json(
      { error: 'Migration failed. Check server logs for details.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Migration endpoint error:', error);
    return NextResponse.json(
      { error: 'Migration failed unexpectedly.' },
      { status: 500 }
    );
  }
}
