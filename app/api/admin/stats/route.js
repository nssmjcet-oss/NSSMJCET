import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {

        // 1. Get Total Users (Using high-performance count aggregation)
        const usersCount = (await adminDb.collection('users').count().get()).data().count;
        // 2. Get Total Events
        const eventsCount = (await adminDb.collection('events').count().get()).data().count;
        // 3. Get Pending Volunteers
        const pendingVolunteersCount = (await adminDb.collection('volunteers').where('status', '==', 'pending').count().get()).data().count;

        return NextResponse.json({
            users: usersCount,
            events: eventsCount,
            volunteers: pendingVolunteersCount
        });

    } catch (error) {
        console.error('Admin stats GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
