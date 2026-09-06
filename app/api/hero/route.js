import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Content } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();
        const hero = await Content.findOne({ _id: 'hero' }).lean();
        return NextResponse.json({ hero: hero || {} }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch hero content' }, { status: 500 });
    }
}
