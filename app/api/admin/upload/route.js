import { NextResponse } from 'next/server';
import { uploadBase64Image } from '@/lib/storage';

export async function POST(request) {
    try {
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
