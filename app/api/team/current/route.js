import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Team, TeamSession } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Identify current active session
        let currentSession = await TeamSession.findOne({ status: 'current' }).lean();
        const currentYear = currentSession?.academicYear || '2025-2026';

        // 2. Fetch only current team members with projection
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

        const members = teamData.map(doc => ({
            ...doc,
            id: doc._id?.toString() || doc._id
        }));

        return NextResponse.json(
            { currentYear, session: currentSession || null, members },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                }
            }
        );
    } catch (error) {
        console.error('Current Team GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch current team: ' + error.message },
            { status: 500 }
        );
    }
}
