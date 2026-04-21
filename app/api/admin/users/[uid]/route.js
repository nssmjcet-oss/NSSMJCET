import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';
import { getAuthUser, requireSuperAdmin } from '@/lib/server-auth';

export async function DELETE(req, { params }) {
    const { uid } = params;

    try {
        const { user, error: authError, status: authStatus } = await getAuthUser(req);
        if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

        const rbacError = requireSuperAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();

        // Check if user exists and their role
        const userDoc = await User.findOne({ uid }).lean();
        if (!userDoc) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (userDoc.role === 'superadmin') {
            return NextResponse.json({ error: 'Super Admin account cannot be deleted.' }, { status: 403 });
        }

        // Delete from Firebase Auth
        await adminAuth.deleteUser(uid);

        // Delete from MongoDB
        await User.deleteOne({ uid });

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
        const { user, error: authError, status: authStatus } = await getAuthUser(req);
        if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

        const rbacError = requireSuperAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

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
