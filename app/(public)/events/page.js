import connectToDatabase from '@/lib/mongodb';
import { Event } from '@/lib/models';
import EventsClient from './EventsClient';

export const metadata = {
    title: 'Events - NSS MJCET',
    description: 'Upcoming and past events organized by NSS MJCET — community service, health camps, environmental drives and more.',
    alternates: {
        canonical: 'https://www.nssmjcet.in/events',
    },
    openGraph: {
        title: 'NSS MJCET Events',
        description: 'Explore upcoming and past events by NSS MJCET — Muffakham Jah College of Engineering and Technology.',
        url: 'https://www.nssmjcet.in/events',
    },
};

// Revalidate this page every minute
export const revalidate = 60;

async function getEvents() {
    try {
        await connectToDatabase();
        const eventsData = await Event.find({ status: 'published' })
            .sort({ date: -1 })
            .lean();

        return eventsData.map(doc => {
            const serialized = {
                ...doc,
                id: doc._id?.toString() || doc._id,
                _id: doc._id?.toString() || doc._id,
                createdBy: doc.createdBy || null,
                date: doc.date instanceof Date ? doc.date.toISOString() : (doc.date || null),
            };
            return JSON.parse(JSON.stringify(serialized));
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

export default async function EventsPage() {
    const events = await getEvents();
    return <EventsClient events={events} />;
}
