import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Note: For full security, verify Firebase ID Token from Authorization header
// For now, assuming authenticated access from client-side route protection

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('chairman').limit(1).get();

        let chairman = null;
        if (!querySnapshot.empty) {
            chairman = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
            // Return empty structure if not found
            chairman = {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                message: { en: '', te: '', hi: '' },
                photo: ''
            };
        }

        return NextResponse.json({ chairman });
    } catch (error) {
        console.error('Chairman GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch chairman' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (id) {
            // Update existing
            await adminDb.collection('chairman').doc(id).update({
                ...data,
                updatedAt: FieldValue.serverTimestamp()
            });
            revalidatePath('/');
            return NextResponse.json({ success: true });
        } else {
            // Create new or update the only one (if we manage it by a fixed ID)
            await adminDb.collection('chairman').doc('info').set({
                ...data,
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
            revalidatePath('/');
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('Chairman PUT error:', error);
        return NextResponse.json({ error: 'Failed to update chairman' }, { status: 500 });
    }
}
