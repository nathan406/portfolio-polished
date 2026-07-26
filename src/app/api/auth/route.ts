import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getAdminPassword, setAdminPassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 });
    }

    const currentAdminPassword = getAdminPassword();
    if (currentPassword !== currentAdminPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Store the new password in memory so it takes effect immediately
    setAdminPassword(newPassword);

    return NextResponse.json({
      message: 'Password updated successfully for this session. The change will persist until the server restarts.',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
