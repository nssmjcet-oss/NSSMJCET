import { adminDb } from '@/lib/firebase-admin';
import TeamClient from './TeamClient';

export const metadata = {
    title: 'Our Team - NSS MJCET',
    description: 'Meet the NSS MJCET team members and office bearers',
};

// Revalidate this page every hour
export const revalidate = 3600;

async function getTeamMembers() {
    try {
        const querySnapshot = await adminDb.collection('team').orderBy('order', 'asc').get();

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const serialized = {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
            };
            return JSON.parse(JSON.stringify(serialized));
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
    }
}

export default async function TeamPage() {
    const members = await getTeamMembers();
    return <TeamClient members={members} />;
}
