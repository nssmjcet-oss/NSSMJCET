export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ProgramOfficer } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();
        const doc = await ProgramOfficer.findOne({}).lean();

        const officer = doc
            ? { ...doc, id: doc._id }
            : {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                quote: { en: '', te: '', hi: '' },
                photo: ''
            };

        return NextResponse.json({ officer }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });
    } catch (error) {
        console.error('ProgramOfficer public GET error:', error);
        return NextResponse.json({ officer: null }, { status: 200 });
    }
}
