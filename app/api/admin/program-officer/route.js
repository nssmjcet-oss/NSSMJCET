import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('programOfficer').limit(1).get();

        let officer = null;
        if (!querySnapshot.empty) {
            officer = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
            officer = {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                quote: { en: '', te: '', hi: '' },
                photo: ''
            };
        }

        return NextResponse.json({ officer });
    } catch (error) {
        console.error('ProgramOfficer admin GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (id) {
            await adminDb.collection('programOfficer').doc(id).update({
                ...data,
                updatedAt: FieldValue.serverTimestamp()
            });
            revalidatePath('/');
            return NextResponse.json({ success: true });
        } else {
            await adminDb.collection('programOfficer').doc('info').set({
                ...data,
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
            revalidatePath('/');
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('ProgramOfficer admin PUT error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
