export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { uploadBase64Image } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

export async function POST(request) {
    try {
        const { user, error: authError, status: authStatus } = await getAuthUser(request);
        if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        const body = await request.json();
        const { base64, folder = 'uploads' } = body;

        if (!base64) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
        }

        const url = await uploadBase64Image(base64, folder);
        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
    }
}
