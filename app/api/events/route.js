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
            return NextResponse.json({
                event: { ...eventDoc, id: eventDoc._id }
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
                images: { $slice: 1 } // Only fetch 1st image for cards/sliders
            }
        )
            .sort({ date: -1 })
            .lean();

        const events = eventsData.map(doc => ({
            ...doc,
            id: doc._id
        }));

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
