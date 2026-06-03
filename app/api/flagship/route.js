import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const flagshipSchema = new mongoose.Schema({ _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() } }, { strict: false, timestamps: true });
const Flagship = mongoose.models.Flagship || mongoose.model('Flagship', flagshipSchema, 'flagships');

export async function GET() {
    try {
        await connectToDatabase();
        const docs = await Flagship.find({}).sort({ order: 1, createdAt: 1 }).lean();
        const flagships = docs.map(d => ({ ...d, id: d._id }));
        return NextResponse.json({ flagships }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
