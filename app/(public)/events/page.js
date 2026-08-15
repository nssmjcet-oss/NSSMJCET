import { Suspense } from 'react';
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

// Revalidate events page every 10 seconds for instant Edge CDN delivery
export const revalidate = 10;

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
    
    const eventSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": events.map((ev, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "item": {
                "@type": "Event",
                "name": typeof ev.title === 'object' ? (ev.title.en || Object.values(ev.title)[0]) : (ev.title || 'NSS Event'),
                "startDate": ev.date,
                "endDate": ev.endDate || ev.date,
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "eventStatus": "https://schema.org/EventScheduled",
                "location": {
                    "@type": "Place",
                    "name": ev.location || "Muffakham Jah College of Engineering & Technology",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Road No. 3, Banjara Hills",
                        "addressLocality": "Hyderabad",
                        "postalCode": "500034",
                        "addressCountry": "IN"
                    }
                },
                "organizer": {
                    "@type": "Organization",
                    "name": "NSS MJCET",
                    "url": "https://www.nssmjcet.in"
                }
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
            />
            <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0.5 }}>Loading events...</div>}>
                <EventsClient events={events} />
            </Suspense>
        </>
    );
}

