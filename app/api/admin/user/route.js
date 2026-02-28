import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Note: For full security, verify ID Token here.

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();

        const users = querySnapshot.docs.map(doc => {
            const data = doc.data();
            delete data.password; // redundant for firebase auth users usually
            return { id: doc.id, ...data };
        });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users: ' + error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const formData = await request.formData();
        const userId = formData.get('userId');
        const name = formData.get('name');
        const role = formData.get('role');
        const position = formData.get('position');
        const isActiveStr = formData.get('isActive');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updateData = {
            name: name || '',
            role: role || 'member',
            position: position || '',
            isActive: isActiveStr === 'true',
            updatedAt: FieldValue.serverTimestamp()
        };

        await adminDb.collection('users').doc(userId).update(updateData);

        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user: ' + error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await adminDb.collection('users').doc(userId).delete();

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user: ' + error.message }, { status: 500 });
    }
}
