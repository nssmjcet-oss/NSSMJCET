import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Content } from '@/lib/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const pageId = searchParams.get('pageId');

        if (!pageId) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        // Use findOne to avoid CastError with string IDs
        const content = await Content.findOne({ _id: pageId }).lean();
        
        return NextResponse.json({ content });
    } catch (error) {
        console.error('Public Content GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}
