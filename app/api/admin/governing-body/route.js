import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('governing_body').orderBy('order', 'asc').get();
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ members });
    } catch (error) {
        console.error('GoverningBody GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, designation, photo, linkedin, order } = body;
        const docRef = await adminDb.collection('governing_body').add({
            name: name || { en: '', te: '', hi: '' },
            designation: designation || { en: '', te: '', hi: '' },
            photo: photo || '',
            linkedin: linkedin || '',
            order: order ?? 0,
            createdAt: FieldValue.serverTimestamp(),
        });
        revalidatePath('/');
        return NextResponse.json({ id: docRef.id, success: true });
    } catch (error) {
        console.error('GoverningBody POST error:', error);
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, name, designation, photo, linkedin, order } = body;
        if (!id) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });

        await adminDb.collection('governing_body').doc(id).set({
            name: name || { en: '', te: '', hi: '' },
            designation: designation || { en: '', te: '', hi: '' },
            photo: photo || '',
            linkedin: linkedin || '',
            order: order ?? 0,
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('GoverningBody PUT error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });

        await adminDb.collection('governing_body').doc(id).delete();
        revalidatePath('/');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('GoverningBody DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
