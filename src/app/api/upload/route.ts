import { NextRequest, NextResponse } from 'next/server';
import { uploadToB2 } from '@/lib/b2';
import { checkAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}-${safeName}`;

    const url = await uploadToB2(buffer, fileName, file.type);
    return NextResponse.json({ url, fileName });
  } catch (error) {
    console.error('Upload error:', error);
    // Include a masked hint of which B2 key this deployment is using, so a
    // mismatched environment variable is easy to spot (never expose the secret).
    const keyId = process.env.B2_ACCESS_KEY_ID || '';
    const suffix = keyId.length >= 4 ? keyId.slice(-4) : '';
    const hint = suffix ? ` — the B2 key on this deployment ends in "${suffix}"` : '';
    return NextResponse.json({ error: `Upload failed${hint}` }, { status: 500 });
  }
}
