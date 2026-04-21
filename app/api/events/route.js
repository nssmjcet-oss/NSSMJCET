import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Event } from '@/lib/models';

export const revalidate = 60; // Refresh every minute for fresh content

export async function GET() {
    try {
        await connectToDatabase();
        const eventsData = await Event.find({ status: 'published' })
            .sort({ date: -1 })
            .lean();

        const events = eventsData.map(doc => ({
            ...doc,
            id: doc._id
        }));

        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error('Events GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events: ' + error.message },
            { status: 500 }
        );
    }
}
