import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('advisorDirector').limit(1).get();

        let advisor = null;
        if (!querySnapshot.empty) {
            advisor = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
            advisor = {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                message: { en: '', te: '', hi: '' },
                photo: ''
            };
        }

        return NextResponse.json({ advisor });
    } catch (error) {
        console.error('AdvisorDirector public GET error:', error);
        return NextResponse.json({ advisor: null }, { status: 200 });
    }
}
