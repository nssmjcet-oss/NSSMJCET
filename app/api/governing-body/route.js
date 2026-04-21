import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { GoverningBody } from '@/lib/models';

export const revalidate = 60;

export async function GET() {
    try {
        await connectToDatabase();
        const data = await GoverningBody.find({}).sort({ order: 1 }).lean();
        const members = data.map(doc => ({ ...doc, id: doc._id }));
        return NextResponse.json({ members });
    } catch (error) {
        console.error('Error fetching governing body:', error);
        return NextResponse.json({ members: [] }, { status: 500 });
    }
}
