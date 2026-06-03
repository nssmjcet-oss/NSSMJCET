import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Announcement } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();
        const announcementsData = await Announcement.find({ isActive: true })
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        const announcements = announcementsData.map(doc => ({
            ...doc,
            id: doc._id
        }));

        return NextResponse.json({ announcements }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });
    } catch (error) {
        console.error('Announcements GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch announcements: ' + error.message },
            { status: 500 }
        );
    }
}
