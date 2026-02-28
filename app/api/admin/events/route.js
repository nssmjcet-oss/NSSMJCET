import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Get all events
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = adminDb.collection('events').orderBy('date', 'desc');

        if (status) {
            query = query.where('status', '==', status);
        }

        const querySnapshot = await query.get();
        const events = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error('Events GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events: ' + error.message },
            { status: 500 }
        );
    }
}

// POST - Create new event
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, date, location, images, status, eventType, createdBy } = body;

        if (!title?.en || !title?.te || !title?.hi || !description?.en || !description?.te || !description?.hi || !date || !location) {
            return NextResponse.json(
                { error: 'Title, description, date, and location are required' },
                { status: 400 }
            );
        }

        const eventData = {
            title,
            description,
            date,
            location,
            images: images || [],
            status: status || 'draft',
            eventType: eventType || 'upcoming',
            createdBy: createdBy || 'admin',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        const docRef = await adminDb.collection('events').add(eventData);

        revalidatePath('/');
        revalidatePath('/events');

        return NextResponse.json(
            { message: 'Event created successfully', id: docRef.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Events POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create event: ' + error.message },
            { status: 500 }
        );
    }
}

// PUT - Update event
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            );
        }

        await adminDb.collection('events').doc(id).update({
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/');
        revalidatePath('/events');

        return NextResponse.json(
            { message: 'Event updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Events PUT error:', error);
        return NextResponse.json(
            { error: 'Failed to update event: ' + error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete event
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            );
        }

        await adminDb.collection('events').doc(id).delete();

        revalidatePath('/');
        revalidatePath('/events');

        return NextResponse.json(
            { message: 'Event deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Events DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete event: ' + error.message },
            { status: 500 }
        );
    }
}
