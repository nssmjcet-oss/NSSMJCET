import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Chairman } from '@/lib/models';

export const revalidate = 0;

export async function GET() {
    try {
        await connectToDatabase();
        const doc = await Chairman.findOne({}).lean();

        const chairman = doc
            ? { ...doc, id: doc._id }
            : {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                message: { en: '', te: '', hi: '' },
                photo: ''
            };

        return NextResponse.json({ chairman });
    } catch (error) {
        console.error('Chairman public GET error:', error);
        return NextResponse.json({ chairman: null }, { status: 200 });
    }
}
