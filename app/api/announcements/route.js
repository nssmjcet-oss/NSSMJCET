import { NextResponse } from 'next/server';
export const revalidate = 3600; // Cache for 1 hour
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('announcements')
            .where('isActive', '==', true)
            .orderBy('priority', 'desc')
            .orderBy('createdAt', 'desc')
            .get();

        const announcements = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ announcements }, { status: 200 });
    } catch (error) {
        console.error('Announcements GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch announcements: ' + error.message },
            { status: 500 }
        );
    }
}
