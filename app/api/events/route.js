import { toMediaUrl } from '@/lib/media-url';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Event } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('id');

        // Detail view for a single event (returns full gallery)
        if (eventId) {
            const eventDoc = await Event.findById(eventId).lean();
            if (!eventDoc) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }
            const detailImages = Array.isArray(eventDoc.images)
                ? eventDoc.images.map((img, idx) => toMediaUrl('events', eventDoc._id, img, '?index=' + idx))
                : [];
            return NextResponse.json({
                event: { ...eventDoc, images: detailImages, id: eventDoc._id }
            }, {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                }
            });
        }

        // Lightweight list view: projection returns ONLY the cover image and list fields
        const eventsData = await Event.find(
            { status: { $ne: 'draft' } },
            {
                title: 1,
                date: 1,
                endDate: 1,
                location: 1,
                category: 1,
                eventType: 1,
                academicYear: 1,
                description: 1,
                status: 1,
                isFeatured: 1,
                short_title: 1,
                shortTitle: 1,
                subtitle: 1,
                tagline: 1,
                images: { $slice: 1 } // Only fetch 1st image for cards/sliders
            }
        )
            .sort({ date: -1 })
            .lean();

        const events = eventsData.map(doc => {
            const id = doc._id?.toString() || doc._id;
            const images = Array.isArray(doc.images)
                ? doc.images.map((img, idx) => toMediaUrl('events', id, img, '?index=' + idx))
                : [];
            return {
                ...doc,
                images,
                id,
                isFeatured: Boolean(doc.isFeatured),
                short_title: doc.short_title || doc.shortTitle || null,
                subtitle: doc.subtitle || doc.tagline || null,
            };
        });

        return NextResponse.json({ events }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
            }
        });
    } catch (error) {
        console.error('Events GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events: ' + error.message },
            { status: 500 }
        );
    }
}
