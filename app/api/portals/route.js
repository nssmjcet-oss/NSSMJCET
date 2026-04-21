import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Portal } from '@/lib/models';

export const revalidate = 60;

export async function GET() {
    try {
        await connectToDatabase();
        const portalsData = await Portal.find({}).sort({ createdAt: 1 }).lean();
        const portals = portalsData.map(doc => ({ ...doc, id: doc._id }));
        return NextResponse.json({ portals }, { status: 200 });
    } catch (error) {
        console.error('Portals GET error:', error);
        return NextResponse.json(
            { portals: [], error: 'Failed to fetch portals: ' + error.message },
            { status: 200 }
        );
    }
}
