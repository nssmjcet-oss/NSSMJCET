import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ProgramOfficer } from '@/lib/models';

export const revalidate = 0;

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

        return NextResponse.json({ officer });
    } catch (error) {
        console.error('ProgramOfficer public GET error:', error);
        return NextResponse.json({ officer: null }, { status: 200 });
    }
}
