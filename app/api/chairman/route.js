import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('chairman').limit(1).get();

        let chairman = null;
        if (!querySnapshot.empty) {
            chairman = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
            chairman = {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                message: { en: '', te: '', hi: '' },
                photo: ''
            };
        }

        return NextResponse.json({ chairman });
    } catch (error) {
        console.error('Chairman public GET error:', error);
        return NextResponse.json({ chairman: null }, { status: 200 });
    }
}
