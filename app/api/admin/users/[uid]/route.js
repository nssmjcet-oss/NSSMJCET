import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function DELETE(req, { params }) {
    const { uid } = params;

    try {
        // 1. Prevent deleting self (Super Admin should not delete themselves if they are the only one)
        // In a real scenario, we'd verify the requester's UID from the token

        // 2. Check if user exists and their role
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (userDoc.data().role === 'superadmin') {
            return NextResponse.json({ error: 'Super Admin account cannot be deleted.' }, { status: 403 });
        }

        // 3. Delete from Firebase Auth
        await adminAuth.deleteUser(uid);

        // 4. Delete from Firestore
        await adminDb.collection('users').doc(uid).delete();

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    const { uid } = params;
    const { password } = await req.json();

    try {
        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }

        // Update password in Firebase Auth
        await adminAuth.updateUser(uid, {
            password: password,
        });

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
