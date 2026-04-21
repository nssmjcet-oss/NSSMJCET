import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Event } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - Get all events
export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const eventStatus = searchParams.get('status');

        let filter = {};
        if (eventStatus) {
            filter.status = eventStatus;
        }

        const eventsData = await Event.find(filter).sort({ date: -1 }).lean();
        
        // Map _id back to id for frontend compatibility
        const events = eventsData.map(doc => ({
            ...doc,
            id: doc._id
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
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { title, description, date, location, images, status: eventStatus, eventType, createdBy } = body;

        if (!title?.en || !title?.te || !title?.hi || !description?.en || !description?.te || !description?.hi || !date || !location) {
            return NextResponse.json(
                { error: 'Title, description, date, and location are required' },
                { status: 400 }
            );
        }

        // Upload any Base64 images to Firebase Storage
        const uploadedImages = await Promise.all(
            (images || []).map(img => maybeUploadImage(img, 'events'))
        );

        const eventData = {
            title,
            description,
            date: new Date(date),
            location,
            images: uploadedImages,
            status: eventStatus || 'published',
            eventType: eventType || 'upcoming',
            createdBy: createdBy || 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const newEvent = await Event.create(eventData);

        revalidatePath('/');
        revalidatePath('/events');
        revalidatePath('/api/events');
        revalidatePath('/api/stats');

        return NextResponse.json(
            { message: 'Event created successfully', id: newEvent._id },
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
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            );
        }

        // Convert string date to Date object if present
        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }

        // Upload any new Base64 images to Firebase Storage
        if (updateData.images && Array.isArray(updateData.images)) {
            updateData.images = await Promise.all(
                updateData.images.map(img => maybeUploadImage(img, 'events'))
            );
        }

        // Ensure id is a simple string if it's a serialized ObjectId object
        const eventId = typeof id === 'object' ? (id.$oid || id.toString()) : id;
 
        let updated = null;
 
        // 1. Try as ObjectId if valid
        if (typeof eventId === 'string' && eventId.length === 24) {
            try {
                updated = await Event.findByIdAndUpdate(
                    new mongoose.Types.ObjectId(eventId),
                    { ...updateData, updatedAt: new Date() },
                    { new: true }
                ).lean();
            } catch (e) {
                console.log('Event ObjectId update failed, trying string format...');
            }
        }
 
        // 2. Try as string
        if (!updated) {
            updated = await Event.findOneAndUpdate(
                { _id: eventId },
                { ...updateData, updatedAt: new Date() },
                { new: true }
            ).lean();
        }
 
        if (!updated) {
            return NextResponse.json(
                { error: 'Event not found in database with ID: ' + eventId },
                { status: 404 }
            );
        }

        revalidatePath('/');
        revalidatePath('/events');
        revalidatePath('/api/events');
        revalidatePath('/api/stats');

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
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            );
        }

        await Event.findByIdAndDelete(id);

        revalidatePath('/');
        revalidatePath('/events');
        revalidatePath('/api/events');
        revalidatePath('/api/stats');

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
