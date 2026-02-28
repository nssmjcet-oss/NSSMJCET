import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('governing_body').orderBy('order', 'asc').get();
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ members });
    } catch (error) {
        console.error('Error fetching governing body:', error);
        return NextResponse.json({ members: [] }, { status: 500 });
    }
}
