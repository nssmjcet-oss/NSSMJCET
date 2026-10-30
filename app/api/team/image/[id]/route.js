import connectToDatabase from '@/lib/mongodb';
import { Team } from '@/lib/models';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return new Response('Missing ID', { status: 400 });
        }

        await connectToDatabase();
        const member = await Team.findById(id, { image: 1 }).lean();

        if (!member || !member.image) {
            return new Response('Image not found', { status: 404 });
        }

        const dataUrl = member.image;

        // Case 1: Base64 data URL (e.g., data:image/jpeg;base64,...)
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
            const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                return new Response(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=31536000, immutable',
                    },
                });
            }
        }

        // Case 2: External HTTP/HTTPS URL
        if (typeof dataUrl === 'string' && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://'))) {
            return NextResponse.redirect(dataUrl, 307);
        }

        // Case 3: Relative path (e.g., /placeholder-team.jpg)
        if (typeof dataUrl === 'string' && dataUrl.startsWith('/')) {
            return NextResponse.redirect(new URL(dataUrl, request.url), 307);
        }

        return new Response('Invalid image data', { status: 404 });
    } catch (error) {
        console.error('Error serving team image:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
