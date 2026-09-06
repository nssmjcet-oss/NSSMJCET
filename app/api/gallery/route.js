import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { GalleryItem } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const year = searchParams.get('year');

        let filter = { isPublished: { $ne: false } };
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (year && year !== 'all') {
            filter.academicYear = year;
        }

        const docs = await GalleryItem.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .lean();

        const items = docs.map(doc => ({
            ...doc,
            id: doc._id
        }));

        return NextResponse.json({ items }, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
            }
        });
    } catch (error) {
        console.error('Gallery GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
