import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { GoverningBody } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const data = await GoverningBody.find({}).sort({ order: 1 }).lean();
        const members = data.map(doc => ({ ...doc, id: doc._id }));
        return NextResponse.json({ members });
    } catch (error) {
        console.error('GoverningBody GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { name, designation, photo, linkedin, order } = body;
        const finalPhoto = await maybeUploadImage(photo, 'governing-body');

        const newMember = await GoverningBody.create({
            name: name || { en: '', te: '', hi: '' },
            designation: designation || { en: '', te: '', hi: '' },
            photo: finalPhoto || '',
            linkedin: linkedin || '',
            order: order ?? 0,
            createdAt: new Date(),
        });
        revalidatePath('/');
        revalidatePath('/api/governing-body');
        return NextResponse.json({ id: newMember._id, success: true });
    } catch (error) {
        console.error('GoverningBody POST error:', error);
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { id, name, designation, photo, linkedin, order } = body;
        if (!id) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });

        const finalPhoto = await maybeUploadImage(photo, 'governing-body');

        // Ensure id is a simple string if it's a serialized ObjectId object
        const memberId = typeof id === 'object' ? (id.$oid || id.toString()) : id;
 
        const updated = await GoverningBody.findOneAndUpdate(
            { _id: memberId },
            {
                name: name || { en: '', te: '', hi: '' },
                designation: designation || { en: '', te: '', hi: '' },
                photo: finalPhoto || '',
                linkedin: linkedin || '',
                order: order ?? 0,
                updatedAt: new Date(),
            },
            { new: true }
        ).lean();
 
        if (!updated) {
            return NextResponse.json({ error: 'Member not found in database with ID: ' + memberId + '. Please try refreshing the page.' }, { status: 404 });
        }
 
        revalidatePath('/');
        revalidatePath('/api/governing-body');
        return NextResponse.json({ success: true, member: { ...updated, id: updated._id.toString() } });
    } catch (error) {
        console.error('GoverningBody PUT error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });

        await GoverningBody.findByIdAndDelete(id);
        revalidatePath('/');
        revalidatePath('/api/governing-body');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('GoverningBody DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
