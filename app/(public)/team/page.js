import connectToDatabase from '@/lib/mongodb';
import { Team, TeamSession } from '@/lib/models';
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

// Revalidate team page every 1 hour (purged instantly on-demand by admin changes via /api/revalidate)
export const revalidate = 3600;

async function getTeamData() {
    try {
        await connectToDatabase();

        // 1. Get current active session
        const currentSession = await TeamSession.findOne({ status: 'current' }).lean();
        const currentYear = currentSession?.academicYear || '2025-2026';

        // 2. Fetch distinct years (metadata only, no photos)
        const distinctYears = await Team.distinct('academicYear');
        const sessionDocs = await TeamSession.find({}, { academicYear: 1, teamYear: 1 }).lean();
        const allYears = Array.from(new Set([...distinctYears, '2025-2026', ...sessionDocs.map(s => s.academicYear)])).filter(Boolean);
        allYears.sort((a, b) => a.localeCompare(b));

        // 3. Fetch ONLY current year members with projection
        const teamData = await Team.find(
            { academicYear: currentYear },
            {
                name: 1,
                role: 1,
                position: 1,
                email: 1,
                linkedin: 1,
                github: 1,
                image: 1,
                order: 1,
                academicYear: 1,
                quote: 1,
            }
        )
            .sort({ order: 1 })
            .lean();

        const members = teamData.map(doc => {
            const serialized = {
                ...doc,
                id: doc._id?.toString() || doc._id,
                _id: doc._id?.toString() || doc._id,
            };
            return JSON.parse(JSON.stringify(serialized));
        });

        return { members, currentYear, allYears };
    } catch (error) {
        console.error('Error fetching team members:', error);
        return { members: [], currentYear: '2025-2026', allYears: ['2025-2026'] };
    }
}

export default async function TeamPage() {
    const { members, currentYear, allYears } = await getTeamData();
    return <TeamClient initialMembers={members} currentYear={currentYear} allYears={allYears} />;
}
