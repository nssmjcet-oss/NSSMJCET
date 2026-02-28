import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch all volunteers
export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('volunteers').orderBy('submittedAt', 'desc').get();
        const volunteers = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                submittedAt: data.submittedAt?.toDate?.() || data.submittedAt || data.createdAt?.toDate?.() || data.createdAt
            };
        });

        return NextResponse.json({ volunteers }, { status: 200 });
    } catch (error) {
        console.error('Volunteer Admin GET error:', error);
        return NextResponse.json({
            error: 'Failed to fetch volunteers: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}

// PUT - Update volunteer status
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
        }

        await adminDb.collection('volunteers').doc(id).update({
            status,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Volunteer Admin PUT error:', error);
        return NextResponse.json({
            error: 'Failed to update volunteer: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}

// DELETE - Delete volunteer
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await adminDb.collection('volunteers').doc(id).delete();

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Volunteer Admin DELETE error:', error);
        return NextResponse.json({
            error: 'Failed to delete volunteer: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}
