import { NextResponse } from 'next/server';
export const revalidate = 3600; // Cache for 1 hour
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('programOfficer').limit(1).get();

        let officer = null;
        if (!querySnapshot.empty) {
            officer = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
            officer = {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                quote: { en: '', te: '', hi: '' },
                photo: ''
            };
        }

        return NextResponse.json({ officer });
    } catch (error) {
        console.error('ProgramOfficer public GET error:', error);
        return NextResponse.json({ officer: null }, { status: 200 });
    }
}
