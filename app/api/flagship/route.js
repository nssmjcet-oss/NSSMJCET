import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const flagshipSchema = new mongoose.Schema({ _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() } }, { strict: false, timestamps: true });
const Flagship = mongoose.models.Flagship || mongoose.model('Flagship', flagshipSchema, 'flagships');

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const id = searchParams.get('id');
        const status = searchParams.get('status');

        if (slug || id) {
            const query = slug ? { slug } : { _id: id };
            const doc = await Flagship.findOne(query).lean();
            if (!doc) {
                return NextResponse.json({ error: 'Initiative not found' }, { status: 404 });
            }
            return NextResponse.json({
                initiative: { ...doc, id: doc._id }
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
                }
            });
        }

        const filter = status ? { status } : {};
        const docs = await Flagship.find(filter).sort({ order: 1, createdAt: 1 }).lean();
        const flagships = docs.map(d => ({ ...d, id: d._id }));
        return NextResponse.json({ flagships }, {
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
            }
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
