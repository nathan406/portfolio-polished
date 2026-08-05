import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, verifyAdminPassword, setAdminPassword } from '@/lib/auth';
import { STRONG_PASSWORD_RE, STRONG_PASSWORD_HINT } from '@/lib/password';
import sql from '@/lib/db';

/**
 * POST /api/auth — verifies a password (used by the login gate).
 * Public by design: it IS the authentication check.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    if (await verifyAdminPassword(password)) {
      return NextResponse.json({ message: 'Authenticated' });
    }
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json({ error: 'Failed to verify password' }, { status: 500 });
  }
}

/**
 * PUT /api/auth — changes the admin password and persists it to the database
 * so the change survives restarts / cold starts.
 */
export async function PUT(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 });
    }

    if (!(await verifyAdminPassword(currentPassword))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    if (!STRONG_PASSWORD_RE.test(newPassword)) {
      return NextResponse.json(
        { error: `New password is too weak. ${STRONG_PASSWORD_HINT}` },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'New password must be different from the current password' }, { status: 400 });
    }

    // Persist to the database FIRST so the change survives restarts / cold
    // starts, and only then take effect in this process. This keeps the
    // runtime override and the stored password consistent even if the DB write fails.
    const existing = await sql`
      SELECT value FROM site_settings WHERE key = 'site_settings' LIMIT 1
    `;
    const currentValue = (existing[0] as { value?: Record<string, unknown> } | undefined)?.value || {};
    const nextValue = { ...currentValue, admin_password: newPassword };

    await sql`
      INSERT INTO site_settings (key, value)
      VALUES ('site_settings', ${JSON.stringify(nextValue)}::jsonb)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;

    setAdminPassword(newPassword);

    return NextResponse.json({
      message: 'Password updated successfully. It stays active even after a server restart.',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
