import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch all contact submissions
export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('contacts').orderBy('submittedAt', 'desc').get();
        const contacts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                submittedAt: data.submittedAt?.toDate?.() || data.submittedAt || data.createdAt?.toDate?.() || data.createdAt // Handle both Timestamp and plain date
            };
        });

        return NextResponse.json({ contacts }, { status: 200 });
    } catch (error) {
        console.error('Contact Admin GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch contact submissions' }, { status: 500 });
    }
}

// PUT - Update contact status
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
        }

        await adminDb.collection('contacts').doc(id).update({
            status,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Contact Admin PUT error:', error);
        return NextResponse.json({ error: 'Failed to update contact status' }, { status: 500 });
    }
}

// DELETE - Delete contact submission
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await adminDb.collection('contacts').doc(id).delete();

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Contact Admin DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete contact submission' }, { status: 500 });
    }
}
