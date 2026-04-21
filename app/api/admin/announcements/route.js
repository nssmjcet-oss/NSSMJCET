import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Announcement } from '@/lib/models';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - Fetch all announcements
export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const announcementsData = await Announcement.find({}).sort({ createdAt: -1 }).lean();
        
        const announcements = announcementsData.map(doc => ({
            ...doc,
            id: doc._id
        }));

        return NextResponse.json({ announcements }, { status: 200 });
    } catch (error) {
        console.error('Announcements GET error:', error);
        return NextResponse.json({
            error: 'Failed to fetch announcements: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// POST - Create new announcement
export async function POST(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { title, content, priority, expiryDate, isActive, createdBy, imageUrl } = body;

        const announcementData = {
            title,
            content,
            priority: priority || 'medium',
            expiryDate: expiryDate || null,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: createdBy || 'admin',
            imageUrl: imageUrl || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const newAnnouncement = await Announcement.create(announcementData);

        revalidatePath('/');
        revalidatePath('/announcements');
        revalidatePath('/api/announcements');

        return NextResponse.json({ message: 'Announcement created successfully', id: newAnnouncement._id }, { status: 201 });
    } catch (error) {
        console.error('Announcements POST error:', error);
        return NextResponse.json({
            error: 'Failed to create announcement: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// PUT - Update announcement
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
            return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
        }

        await Announcement.findByIdAndUpdate(id, {
            ...updateData,
            updatedAt: new Date(),
        });

        revalidatePath('/');
        revalidatePath('/announcements');
        revalidatePath('/api/announcements');

        return NextResponse.json({ message: 'Announcement updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Announcements PUT error:', error);
        return NextResponse.json({
            error: 'Failed to update announcement: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// DELETE - Delete announcement
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
            return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
        }

        await Announcement.findByIdAndDelete(id);

        revalidatePath('/');
        revalidatePath('/announcements');
        revalidatePath('/api/announcements');

        return NextResponse.json({ message: 'Announcement deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Announcements DELETE error:', error);
        return NextResponse.json({
            error: 'Failed to delete announcement: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
