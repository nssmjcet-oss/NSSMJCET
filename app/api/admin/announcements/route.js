import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch all announcements
export async function GET() {
    try {
        if (!adminDb) {
            throw new Error('Firebase Admin DB not initialized. Check your environment variables.');
        }
        const querySnapshot = await adminDb.collection('announcements').orderBy('createdAt', 'desc').get();
        const announcements = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ announcements }, { status: 200 });
    } catch (error) {
        console.error('Announcements GET error:', error);
        return NextResponse.json({
            error: 'Failed to fetch announcements: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}

// POST - Create new announcement
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, content, priority, expiryDate, isActive, createdBy, imageUrl } = body;

        const docRef = await adminDb.collection('announcements').add({
            title,
            content,
            priority: priority || 'medium',
            expiryDate: expiryDate || null,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: createdBy || 'admin',
            imageUrl: imageUrl || null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/');
        revalidatePath('/announcements');

        return NextResponse.json({ message: 'Announcement created successfully', id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('Announcements POST error:', error);
        return NextResponse.json({
            error: 'Failed to create announcement: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}

// PUT - Update announcement
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
        }

        await adminDb.collection('announcements').doc(id).update({
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/');
        revalidatePath('/announcements');

        return NextResponse.json({ message: 'Announcement updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Announcements PUT error:', error);
        return NextResponse.json({
            error: 'Failed to update announcement: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}

// DELETE - Delete announcement
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
        }

        await adminDb.collection('announcements').doc(id).delete();

        revalidatePath('/');
        revalidatePath('/announcements');

        return NextResponse.json({ message: 'Announcement deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Announcements DELETE error:', error);
        return NextResponse.json({
            error: 'Failed to delete announcement: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}
