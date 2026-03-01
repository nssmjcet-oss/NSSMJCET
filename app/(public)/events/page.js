import { adminDb } from '@/lib/firebase-admin';
import EventsClient from './EventsClient';

export const metadata = {
    title: 'Events - NSS MJCET',
    description: 'Upcoming and past events organized by NSS MJCET',
};

// Revalidate this page every hour
export const revalidate = 3600;

async function getEvents() {
    try {
        const querySnapshot = await adminDb.collection('events')
            .where('status', '==', 'published')
            .orderBy('date', 'desc')
            .get();

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const serialized = {
                ...data,
                id: doc.id,
                _id: doc.id,
                createdBy: data.createdBy || null,
                date: data.date?.toDate?.()?.toISOString() || data.date || null,
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
