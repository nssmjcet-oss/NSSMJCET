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

// POST - Add new developer (DISABLED - Section is permanent)
export async function POST(request) {
    return NextResponse.json(
        { error: 'Additions are disabled. The Developers section is a permanent tribute.' },
        { status: 403 }
    );
}

// PUT - Update developer (ONLY Image is editable)
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, image } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await adminDb.collection('developers').doc(id).update({
            image: image || '',
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/');
        return NextResponse.json({ message: 'Developer photo updated' }, { status: 200 });
    } catch (error) {
        console.error('Admin Developers PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove developer (DISABLED - Section is permanent)
export async function DELETE(request) {
    return NextResponse.json(
        { error: 'Deletions are disabled. The Developers section is a permanent tribute.' },
        { status: 403 }
    );
}
