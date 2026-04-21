import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        await connectToDatabase();

        // Check the users collection in MongoDB
        const userDoc = await User.findOne({ uid }).lean();

        if (userDoc) {
            return NextResponse.json({
                uid,
                email: decodedToken.email,
                role: userDoc.role,
                database: 'VERIFIED SERVER-SIDE (MongoDB)',
                source: 'users'
            });
        }

        return NextResponse.json({
            uid,
            role: 'NONE',
            error: 'No user document found in MongoDB'
        });

    } catch (error) {
        console.error('Server Role Check Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
