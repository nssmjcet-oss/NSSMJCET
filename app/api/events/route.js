import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('events')
            .orderBy('date', 'desc')
            .get();

        const events = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error('Events GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events: ' + error.message },
            { status: 500 }
        );
    }
}
