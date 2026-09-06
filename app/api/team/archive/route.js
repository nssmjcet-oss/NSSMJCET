import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Team, TeamSession } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');

        // Case 1: Specific Year requested -> fetch members for that year on-demand
        if (year) {
            const teamData = await Team.find(
                { academicYear: year },
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

            const members = teamData.map(doc => ({
                ...doc,
                id: doc._id?.toString() || doc._id
            }));

            const sessionInfo = await TeamSession.findOne({ academicYear: year }).lean();

            return NextResponse.json(
                { year, session: sessionInfo || null, members },
                {
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                    }
                }
            );
        }

        // Case 2: No year requested -> return list of available academic years (metadata only, zero photos!)
        const currentSession = await TeamSession.findOne({ status: 'current' }).lean();
        const currentYear = currentSession?.academicYear || '2025-2026';

        const distinctYears = await Team.distinct('academicYear');
        const sessionDocs = await TeamSession.find({}).lean();
        const sessionMap = new Map(sessionDocs.map(s => [s.academicYear, s]));

        // Include all years from team members and sessions
        const allYears = Array.from(new Set([...distinctYears, '2025-2026', ...sessionDocs.map(s => s.academicYear)])).filter(Boolean);
        allYears.sort((a, b) => b.localeCompare(a)); // Newest first

        // Mark which is current vs archived
        const archiveYears = allYears.map(yr => {
            const sess = sessionMap.get(yr);
            return {
                academicYear: yr,
                status: (yr === currentYear || sess?.status === 'current') ? 'current' : 'archived',
                title: sess?.title || { en: `Team ${yr}`, te: '', hi: '' },
                description: sess?.description || { en: `Historical team archive for session ${yr}`, te: '', hi: '' },
            };
        });

        return NextResponse.json(
            { currentYear, years: archiveYears },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                }
            }
        );
    } catch (error) {
        console.error('Archive Team GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team archive: ' + error.message },
            { status: 500 }
        );
    }
}
