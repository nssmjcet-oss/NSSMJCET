import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('advisorDirector').limit(1).get();

        let advisor = null;
        if (!querySnapshot.empty) {
            advisor = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        } else {
            advisor = {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                message: { en: '', te: '', hi: '' },
                photo: ''
            };
        }

        return NextResponse.json({ advisor });
    } catch (error) {
        console.error('AdvisorDirector Admin GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch advisor director' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (id) {
            await adminDb.collection('advisorDirector').doc(id).update({
                ...data,
                updatedAt: FieldValue.serverTimestamp()
            });
        } else {
            await adminDb.collection('advisorDirector').doc('info').set({
                ...data,
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
        }
        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('AdvisorDirector Admin PUT error:', error);
        return NextResponse.json({ error: 'Failed to update advisor director' }, { status: 500 });
    }
}
