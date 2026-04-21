import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';
import { getAuthUser, requireSuperAdmin } from '@/lib/server-auth';

export async function GET(req) {
    try {
        const { user, error, status } = await getAuthUser(req);
        if (error) return NextResponse.json({ error }, { status });

        const authError = requireSuperAdmin(user);
        if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

        await connectToDatabase();

        // List all users from Firebase Auth
        const listUsersResult = await adminAuth.listUsers();

        // Fetch roles for all users from MongoDB
        const usersWithRoles = await Promise.all(
            listUsersResult.users.map(async (userRecord) => {
                const userDoc = await User.findOne({ uid: userRecord.uid }).lean();
                return {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    role: userDoc ? userDoc.role : 'user',
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
        const { user, error: authError, status: authStatus } = await getAuthUser(req);
        if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

        const rbacError = requireSuperAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { email, password, role } = await req.json();

        // Check total admin count (Max 9 admins + 1 superadmin)
        const adminsCount = await User.countDocuments({ role: 'admin' });
        if (adminsCount >= 9 && role === 'admin') {
            return NextResponse.json({ error: 'Maximum limit of 9 admin accounts reached.' }, { status: 400 });
        }

        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            emailVerified: true,
        });

        // Set role in MongoDB
        await User.create({
            uid: userRecord.uid,
            email: email,
            role: role || 'admin',
            createdAt: new Date(),
        });

        return NextResponse.json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
    }
}
