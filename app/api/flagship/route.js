import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const flagshipSchema = new mongoose.Schema({ _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() } }, { strict: false, timestamps: true });
const Flagship = mongoose.models.Flagship || mongoose.model('Flagship', flagshipSchema, 'flagships');

export async function GET() {
    try {
        await connectToDatabase();
        const docs = await Flagship.find({}).sort({ order: 1, createdAt: 1 }).lean();
        const flagships = docs.map(d => ({ ...d, id: d._id }));
        return NextResponse.json({ flagships }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
