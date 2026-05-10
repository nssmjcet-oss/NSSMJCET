import connectToDatabase from '@/lib/mongodb';
import { Team } from '@/lib/models';
import TeamClient from './TeamClient';

export const metadata = {
    title: 'Our Team - NSS MJCET',
    description: 'Meet the NSS MJCET team — office bearers, core members, and dedicated volunteers at Muffakham Jah College of Engineering and Technology.',
    alternates: {
        canonical: 'https://www.nssmjcet.in/team',
    },
    openGraph: {
        title: 'NSS MJCET Team',
        description: 'Meet the office bearers, core members, and volunteers of NSS MJCET.',
        url: 'https://www.nssmjcet.in/team',
    },
};

// Revalidate this page every minute
export const revalidate = 60;

async function getTeamMembers() {
    try {
        await connectToDatabase();
        const teamData = await Team.find({}).sort({ order: 1 }).lean();

        return teamData.map(doc => {
            const serialized = {
                ...doc,
                id: doc._id?.toString() || doc._id,
                _id: doc._id?.toString() || doc._id,
                createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || null),
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
