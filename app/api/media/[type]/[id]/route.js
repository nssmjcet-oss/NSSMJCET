import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import {
    Event,
    Announcement,
    Developer,
    Team,
    Chairman,
    ProgramOfficer,
    GoverningBody,
    Flagship,
    GalleryItem,
    Content
} from '@/lib/models';

export const dynamic = 'force-dynamic';

function serveDataUrl(dataUrl, request) {
    if (!dataUrl || typeof dataUrl !== 'string') {
        return new Response('Image not found', { status: 404 });
    }

    // 1. Data URL (Base64)
    if (dataUrl.startsWith('data:')) {
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

    // 2. Absolute URL (http / https)
    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        return NextResponse.redirect(dataUrl, 307);
    }

    // 3. Local relative path (e.g. /placeholder.jpg)
    if (dataUrl.startsWith('/')) {
        return NextResponse.redirect(new URL(dataUrl, request.url), 307);
    }

    return new Response('Invalid image format', { status: 404 });
}

export async function GET(request, { params }) {
    try {
        const { type, id } = await params;
        if (!type || !id) {
            return new Response('Missing parameters', { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        await connectToDatabase();

        let dataUrl = null;

        switch (type) {
            case 'events': {
                const doc = await Event.findById(id, { images: 1 }).lean();
                if (doc && Array.isArray(doc.images)) {
                    const idx = parseInt(searchParams.get('index') || '0', 10);
                    dataUrl = doc.images[idx] || doc.images[0];
                }
                break;
            }
            case 'gallery': {
                const doc = await GalleryItem.findById(id, { image: 1, thumbnail: 1 }).lean();
                if (doc) {
                    const isThumb = searchParams.get('thumb') === '1' || searchParams.get('thumb') === 'true';
                    dataUrl = isThumb ? (doc.thumbnail || doc.image) : doc.image;
                }
                break;
            }
            case 'announcements': {
                const doc = await Announcement.findById(id, { imageUrl: 1, image: 1 }).lean();
                if (doc) dataUrl = doc.imageUrl || doc.image;
                break;
            }
            case 'flagship': {
                const doc = await Flagship.findById(id, { image: 1 }).lean();
                if (doc) dataUrl = doc.image;
                break;
            }
            case 'governing-body': {
                const doc = await GoverningBody.findById(id, { photo: 1, image: 1 }).lean();
                if (doc) dataUrl = doc.photo || doc.image;
                break;
            }
            case 'developers': {
                const doc = await Developer.findById(id, { image: 1 }).lean();
                if (doc) dataUrl = doc.image;
                break;
            }
            case 'chairman': {
                const doc = await Chairman.findById(id, { photo: 1 }).lean();
                if (doc) dataUrl = doc.photo;
                break;
            }
            case 'program-officer': {
                const doc = await ProgramOfficer.findById(id, { photo: 1 }).lean();
                if (doc) dataUrl = doc.photo;
                break;
            }
            case 'team': {
                const doc = await Team.findById(id, { image: 1 }).lean();
                if (doc) dataUrl = doc.image;
                break;
            }
            case 'content': {
                const doc = await Content.findById(id, { image: 1 }).lean();
                if (doc) dataUrl = doc.image;
                break;
            }
            default:
                return new Response('Unknown resource type', { status: 400 });
        }

        return serveDataUrl(dataUrl, request);
    } catch (err) {
        console.error('Media route error:', err);
        return new Response('Internal error', { status: 500 });
    }
}
