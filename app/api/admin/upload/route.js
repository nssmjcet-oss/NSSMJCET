import { NextResponse } from 'next/server';
import { saveFile } from '@/lib/upload';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const url = await saveFile(file);

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error('Upload Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Upload failed: ' + message }, { status: 500 });
    }
}
