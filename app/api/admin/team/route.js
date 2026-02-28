import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Get all team members
export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('team').orderBy('order', 'asc').get();
        const team = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ team }, { status: 200 });
    } catch (error) {
        console.error('Team GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create Team Member
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, role, position, email, linkedin, github, image, order } = body;

        if (!name || (!name.en && typeof name !== 'string')) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!role) {
            return NextResponse.json({ error: 'Role is required' }, { status: 400 });
        }

        const docRef = await adminDb.collection('team').add({
            name,
            role,
            position: position || '',
            email: email || '',
            linkedin: linkedin || '',
            github: github || '',
            image: image || '',
            order: order !== undefined ? order : 0,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/team');

        return NextResponse.json({ message: 'Team member added', id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('Team POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update Member
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await adminDb.collection('team').doc(id).update({
            ...data,
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/team');

        return NextResponse.json({ message: 'Updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Team PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete Member
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await adminDb.collection('team').doc(id).delete();

        revalidatePath('/team');

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Team DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
