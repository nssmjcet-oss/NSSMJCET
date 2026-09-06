import connectToDatabase from '@/lib/mongodb';
import { Team, TeamSession } from '@/lib/models';
import ArchiveClient from './ArchiveClient';

export const metadata = {
    title: 'NSS MJCET Historical Team Archive',
    description: 'Explore the historical archive of past NSS MJCET office bearers, executive committees, and core members across academic years.',
    alternates: {
        canonical: 'https://www.nssmjcet.in/team/archive',
    },
    openGraph: {
        title: 'NSS MJCET Historical Team Archive',
        description: 'Past teams and leaders of National Service Scheme, Muffakham Jah College of Engineering and Technology.',
        url: 'https://www.nssmjcet.in/team/archive',
    },
};

export const revalidate = 3600;

async function getArchiveSessions() {
    try {
        await connectToDatabase();

        const currentSession = await TeamSession.findOne({ status: 'current' }).lean();
        const currentYear = currentSession?.academicYear || '2025-2026';

        const distinctYears = await Team.distinct('academicYear');
        const sessionDocs = await TeamSession.find({}).lean();
        const sessionMap = new Map(sessionDocs.map(s => [s.academicYear, s]));

        const allYears = Array.from(new Set([...distinctYears, '2025-2026', ...sessionDocs.map(s => s.academicYear)])).filter(Boolean);
        allYears.sort((a, b) => b.localeCompare(a));

        // Get member counts per year without fetching images
        const counts = await Promise.all(
            allYears.map(yr => Team.countDocuments({ academicYear: yr }))
        );

        const years = allYears.map((yr, idx) => {
            const sess = sessionMap.get(yr);
            return {
                academicYear: yr,
                status: (yr === currentYear || sess?.status === 'current') ? 'current' : 'archived',
                memberCount: counts[idx] || 0,
                title: sess?.title || { en: `Team ${yr}`, te: '', hi: '' },
                description: sess?.description || { en: `Governing Body, Executive Committee, and Core Team for ${yr}`, te: '', hi: '' }
            };
        });

        return { years, currentYear };
    } catch (error) {
        console.error('Error fetching archive sessions:', error);
        return { years: [{ academicYear: '2025-2026', status: 'current', memberCount: 0 }], currentYear: '2025-2026' };
    }
}

export default async function TeamArchivePage() {
    const { years, currentYear } = await getArchiveSessions();
    return <ArchiveClient initialYears={years} currentYear={currentYear} />;
}
