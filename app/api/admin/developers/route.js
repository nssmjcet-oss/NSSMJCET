import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// GET - Get all developers for admin panel
export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('developers').orderBy('order_index', 'asc').get();
        const developers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ developers }, { status: 200 });
    } catch (error) {
        console.error('Admin Developers GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Add new developer
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, role, image, github_url, linkedin_url, is_active, order_index } = body;

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const docRef = await adminDb.collection('developers').add({
            name,
            role: role || 'Developer',
            image: image || '',
            github_url: github_url || '',
            linkedin_url: linkedin_url || '',
            is_active: is_active !== undefined ? is_active : true,
            order_index: order_index !== undefined ? order_index : 0,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/');
        return NextResponse.json({ message: 'Developer added', id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('Admin Developers POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update developer
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await adminDb.collection('developers').doc(id).update({
            ...data,
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/');
        return NextResponse.json({ message: 'Developer updated' }, { status: 200 });
    } catch (error) {
        console.error('Admin Developers PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove developer
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await adminDb.collection('developers').doc(id).delete();

        revalidatePath('/');
        return NextResponse.json({ message: 'Developer deleted' }, { status: 200 });
    } catch (error) {
        console.error('Admin Developers DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
