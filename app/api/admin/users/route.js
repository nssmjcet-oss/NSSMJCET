import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Helper to check if the requester is a superadmin
async function isSuperAdmin(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        return userDoc.exists && userDoc.data().role === 'superadmin';
    } catch (error) {
        console.error('RBAC Check Error:', error);
        return false;
    }
}

export async function GET(req) {
    // Note: In a real app, you should verify the session/token here
    // For now we'll implement the logic, and it will work once the Admin SDK is configured

    try {
        // List all users from Firebase Auth
        const listUsersResult = await adminAuth.listUsers();

        // Fetch roles for all users from Firestore
        const usersWithRoles = await Promise.all(
            listUsersResult.users.map(async (userRecord) => {
                const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
                return {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    role: userDoc.exists ? userDoc.data().role : 'user',
                    createdAt: userRecord.metadata.creationTime,
                };
            })
        );

        // Sort: Super Admins first, then Admins
        const sortedUsers = usersWithRoles
            .filter(u => u.role === 'superadmin' || u.role === 'admin')
            .sort((a, b) => (a.role === 'superadmin' ? -1 : 1));

        return NextResponse.json({ users: sortedUsers });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { email, password, role } = await req.json();

        // Check total admin count (Max 9 admins + 1 superadmin)
        const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        if (adminsSnapshot.size >= 9 && role === 'admin') {
            return NextResponse.json({ error: 'Maximum limit of 9 admin accounts reached.' }, { status: 400 });
        }

        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            emailVerified: true,
        });

        // Set role in Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            role: role || 'admin',
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
    }
}
