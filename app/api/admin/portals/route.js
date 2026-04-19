import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Admin routes do not use revalidate caching because we need fresh states
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const querySnapshot = await adminDb.collection('portals')
            .orderBy('createdAt', 'desc')
            .get();

        const portals = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ portals }, { status: 200 });
    } catch (error) {
        console.error('Admin Portals GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portals: ' + error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        
        if (!data.title?.en || !data.url) {
            return NextResponse.json(
                { error: 'Title and URL are required' },
                { status: 400 }
            );
        }

        const newPortal = {
            ...data,
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb.collection('portals').add(newPortal);

        return NextResponse.json(
            { message: 'Portal added successfully', id: docRef.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Admin Portals POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create portal: ' + error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const data = await request.json();
        
        if (!data.id) {
            return NextResponse.json(
                { error: 'Portal ID is required' },
                { status: 400 }
            );
        }

        const { id, ...updateData } = data;
        updateData.updatedAt = new Date().toISOString();

        await adminDb.collection('portals').doc(id).update(updateData);

        return NextResponse.json(
            { message: 'Portal updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Admin Portals PUT error:', error);
        return NextResponse.json(
            { error: 'Failed to update portal: ' + error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Portal ID is required' }, { status: 400 });
        }

        await adminDb.collection('portals').doc(id).delete();

        return NextResponse.json({ message: 'Portal deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Admin Portals DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete portal: ' + error.message },
            { status: 500 }
        );
    }
}
