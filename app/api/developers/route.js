import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('developers')
            .where('is_active', '==', true)
            .orderBy('order_index', 'asc')
            .get();

        const developers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ developers });
    } catch (error) {
        console.error('Public Developers GET error:', error);
        return NextResponse.json({ developers: [] }, { status: 200 });
    }
}
