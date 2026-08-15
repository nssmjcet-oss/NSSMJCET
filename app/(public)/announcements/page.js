import connectToDatabase from '@/lib/mongodb';
import { Announcement } from '@/lib/models';
import AnnouncementsClient from './AnnouncementsClient';

export const metadata = {
    title: 'Announcements - NSS MJCET',
    description: 'Latest announcements, notices, and updates from NSS MJCET.',
    alternates: {
        canonical: 'https://www.nssmjcet.in/announcements',
    },
    openGraph: {
        title: 'NSS MJCET Announcements',
        description: 'Latest announcements, notices, and updates from NSS MJCET.',
        url: 'https://www.nssmjcet.in/announcements',
    },
};

// Revalidate announcements page every 10 seconds for instant Edge CDN loading
export const revalidate = 10;

async function getAnnouncements() {
    try {
        await connectToDatabase();
        const docs = await Announcement.find({ isActive: { $ne: false } })
            .sort({ createdAt: -1 })
            .lean();

        return docs.map(doc => {
            const serialized = {
                ...doc,
                id: doc._id?.toString() || doc._id,
                _id: doc._id?.toString() || doc._id,
                createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || null),
                updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || null),
            };
            return JSON.parse(JSON.stringify(serialized));
        });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return [];
    }
}

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements();
    return <AnnouncementsClient initialAnnouncements={announcements} />;
}
