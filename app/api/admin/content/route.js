import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'content' or 'settings'

        if (type === 'settings') {
            const settingsDoc = await adminDb.collection('siteSettings').doc('main').get();
            if (settingsDoc.exists) {
                return NextResponse.json({ settings: settingsDoc.data() }, { status: 200 });
            } else {
                return NextResponse.json({ settings: { serviceHours: 0, peopleBenefited: 0 } }, { status: 200 });
            }
        }

        const pageId = searchParams.get('pageId');
        if (pageId) {
            const contentDoc = await adminDb.collection('content').doc(pageId).get();
            if (contentDoc.exists) {
                return NextResponse.json({ content: contentDoc.data() }, { status: 200 });
            } else {
                return NextResponse.json({ content: null }, { status: 200 });
            }
        }

        const querySnapshot = await adminDb.collection('content').get();
        const contents = querySnapshot.docs.map(doc => ({
            pageId: doc.id,
            title: doc.data().title,
            updatedAt: doc.data().updatedAt
        }));

        return NextResponse.json({ contents }, { status: 200 });

    } catch (error) {
        console.error('Error fetching content:', error);
        return NextResponse.json({
            error: 'Failed to fetch content: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { type } = body;

        if (type === 'settings') {
            const { serviceHours, peopleBenefited, volunteers, events } = body;
            await adminDb.collection('siteSettings').doc('main').set({
                serviceHours,
                peopleBenefited,
                volunteers,
                events,
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
            revalidatePath('/');
            return NextResponse.json({ message: 'Settings updated' }, { status: 200 });
        }

        const { pageId, title, content, sections } = body;
        if (!pageId) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        await adminDb.collection('content').doc(pageId).set({
            title,
            content,
            sections,
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        revalidatePath('/');
        // Also revalidate about page if it's content-driven
        revalidatePath('/about');

        return NextResponse.json({ message: 'Content updated' }, { status: 200 });
    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json({
            error: 'Failed to update content: ' + error.message,
            stack: error.stack,
            dbInitialized: !!adminDb
        }, { status: 500 });
    }
}
