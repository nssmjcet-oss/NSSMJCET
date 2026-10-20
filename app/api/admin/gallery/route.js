export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { GalleryItem } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - All items
export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        let docs = await GalleryItem.find({}).sort({ order: 1, createdAt: -1 }).lean();

        if (docs.length === 0) {
            const initialPhotos = [
                { title: 'Youth Community Rally', category: 'Community Service', caption: 'Active community youth outreach and empowerment drive.', image: '/uploads/events/1772212213205-20251110130725.jpg', academicYear: '2025-2026', order: 1, isPublished: true, createdAt: new Date() },
                { title: 'Annual Youth Convention', category: 'Youth Parliament & MUN', caption: 'Statewide student convention discussing civic duties & democracy.', image: '/uploads/events/1772212213217-20251110152340.jpg', academicYear: '2025-2026', order: 2, isPublished: true, createdAt: new Date() },
                { title: 'Faculty Interactive Forum', category: 'Campus Activities', caption: 'Interactive symposium on social responsibility in technical education.', image: '/uploads/events/1772212213224-20251110145020.jpg', academicYear: '2025-2026', order: 3, isPublished: true, createdAt: new Date() },
                { title: 'Campus Cultural Initiative', category: 'Health & Awareness', caption: 'Cultural awareness campaign for community health and sanitation.', image: '/uploads/events/1772219830828-Untitleddesign4.jpg', academicYear: '2025-2026', order: 4, isPublished: true, createdAt: new Date() },
                { title: 'Volunteer Training Programme', category: 'Volunteer Life', caption: 'Comprehensive induction and field orientation for student volunteers.', image: '/uploads/events/1772258937302-DSC90851.jpg', academicYear: '2025-2026', order: 5, isPublished: true, createdAt: new Date() },
                { title: 'Social Service Induction', category: 'Community Service', caption: 'Oath-taking ceremony for newly inducted NSS MJCET volunteers.', image: '/uploads/events/1772212567791-NSS01-3.jpg', academicYear: '2025-2026', order: 6, isPublished: true, createdAt: new Date() },
                { title: 'NSS Student Volunteers', category: 'Campus Activities', caption: 'Student leadership council driving campus sustainability initiatives.', image: '/uploads/events/1772212567799-NSS01-1.jpg', academicYear: '2025-2026', order: 7, isPublished: true, createdAt: new Date() },
            ];
            try {
                await GalleryItem.insertMany(initialPhotos);
                docs = await GalleryItem.find({}).sort({ order: 1, createdAt: -1 }).lean();
            } catch (_) {}
        }

        const items = docs.map(d => ({
            ...d,
            id: d._id?.toString() || d._id,
            image: d.image || d.imageUrl || d.url || ''
        }));
        return NextResponse.json({ items });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create item
export async function POST(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { image, title, caption, category, academicYear, order } = body;

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const uploadedImage = await maybeUploadImage(image, 'gallery');

        const item = await GalleryItem.create({
            image: uploadedImage,
            title: title || '',
            caption: caption || '',
            category: category || 'General',
            academicYear: academicYear || '2026-2027',
            order: order ? Number(order) : 1,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        revalidatePath('/gallery');
        revalidatePath('/api/gallery');

        return NextResponse.json({ item: { ...item.toObject(), id: item._id } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update item
export async function PUT(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        if (updateData.image) {
            updateData.image = await maybeUploadImage(updateData.image, 'gallery');
        }

        const updated = await GalleryItem.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        ).lean();

        if (!updated) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        revalidatePath('/gallery');
        revalidatePath('/api/gallery');

        return NextResponse.json({ item: { ...updated, id: updated._id } });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove item
export async function DELETE(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await GalleryItem.findByIdAndDelete(id);

        revalidatePath('/gallery');
        revalidatePath('/api/gallery');

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
