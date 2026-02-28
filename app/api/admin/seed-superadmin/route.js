import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// One-time endpoint to bootstrap the superadmin role.
// This uses the Admin SDK which bypasses Firestore security rules.
// IMPORTANT: This endpoint should be deleted after use or protected more strongly.
export async function POST(req) {
    try {
        // Require a secret key to prevent unauthorized use
        const { secretKey, email } = await req.json();

        const SEED_SECRET = process.env.SEED_SECRET || 'nss-mjcet-seed-2024';
        if (secretKey !== SEED_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Get the user by email from Firebase Auth
        let userRecord;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
        } catch (err) {
            return NextResponse.json({ error: `User not found in Firebase Auth: ${err.message}` }, { status: 404 });
        }

        const uid = userRecord.uid;

        // Write the superadmin role directly using Admin SDK (bypasses security rules)
        await adminDb.collection('users').doc(uid).set({
            uid,
            email: userRecord.email,
            role: 'superadmin',
            createdAt: new Date().toISOString(),
        }, { merge: true });

        return NextResponse.json({
            success: true,
            message: `Successfully set role 'superadmin' for ${email}`,
            uid,
        });
    } catch (error) {
        console.error('Seed Super Admin Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
