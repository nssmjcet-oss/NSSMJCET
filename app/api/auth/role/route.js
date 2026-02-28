import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check both common colelction names
        const collections = ['users', 'user'];
        let role = 'NONE';
        let foundColl = null;

        for (const coll of collections) {
            const userDoc = await adminDb.collection(coll).doc(uid).get();
            if (userDoc.exists) {
                role = userDoc.data().role;
                foundColl = coll;
                break;
            }
        }

        if (foundColl) {
            return NextResponse.json({
                uid,
                email: decodedToken.email,
                role,
                database: 'VERIFIED SERVER-SIDE (default ID matches)',
                source: foundColl
            });
        }

        return NextResponse.json({
            uid,
            role: 'NONE',
            error: `No document found in Firestore collections: ${collections.join(', ')}`
        });

    } catch (error) {
        console.error('Server Role Check Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
