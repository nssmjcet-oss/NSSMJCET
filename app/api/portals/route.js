import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 3600; // ISR: cache for 1 hour to protect Firebase free tier

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ portals: [] }, { status: 200 });
        }

        const querySnapshot = await adminDb.collection('portals')
            .orderBy('createdAt', 'asc') // We will use a createdAt timestamp to order them
            .get();

        const portals = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ portals }, { status: 200 });
    } catch (error) {
        console.error('Portals GET error:', error);
        // It's a public route, returning empty array on error prevents UI crashes
        return NextResponse.json(
            { portals: [], error: 'Failed to fetch portals: ' + error.message },
            { status: 200 }
        );
    }
}
