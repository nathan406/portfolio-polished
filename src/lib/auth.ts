import { NextRequest } from 'next/server';

// Runtime-stored password that can be changed via the admin dashboard
let runtimePassword: string | null = null;

// The default password from environment - this is the initial value
export function getAdminPassword(): string {
  return runtimePassword || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
}

export function setAdminPassword(newPassword: string): void {
  runtimePassword = newPassword;
}

export function checkAuth(request: NextRequest): boolean {
  if (request.method === 'GET') return true;
  const authHeader = request.headers.get('x-admin-key');
  return authHeader === getAdminPassword();
}
