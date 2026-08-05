import { NextRequest } from 'next/server';
import sql from '@/lib/db';

// Runtime-stored password override — takes effect immediately in this process,
// but is lost on restart/cold start. The database copy is the source of truth.
let runtimePassword: string | null = null;

export function setAdminPassword(newPassword: string): void {
  runtimePassword = newPassword;
}

// Password persisted in site_settings — survives restarts / cold starts.
export async function getDbAdminPassword(): Promise<string | null> {
  try {
    const result = await sql`
      SELECT value FROM site_settings WHERE key = 'site_settings' LIMIT 1
    `;
    const value = (result[0] as { value?: Record<string, unknown> } | undefined)?.value;
    const pw = value?.admin_password;
    return typeof pw === 'string' && pw.trim() ? pw : null;
  } catch {
    return null;
  }
}

// True when `candidate` matches the current admin password.
// Precedence: runtime override → database-persisted password → env/default.
// Once a password is set in the database, the default 'admin123' stops working
// (an explicitly configured NEXT_PUBLIC_ADMIN_PASSWORD still works as a recovery path).
export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  if (!candidate) return false;

  // Fast path: in-memory override set during a password change
  if (runtimePassword && candidate === runtimePassword) return true;

  const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const dbPassword = await getDbAdminPassword();

  if (dbPassword) {
    // A password has been set in the database — it is authoritative
    if (candidate === dbPassword) return true;
    if (envPassword && candidate === envPassword) return true;
    return false;
  }

  // No database password yet — fall back to env/default
  return candidate === (envPassword || 'admin123');
}

export async function checkAuth(request: NextRequest): Promise<boolean> {
  if (request.method === 'GET') return true;
  return verifyAdminPassword(request.headers.get('x-admin-key') || '');
}
