import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Chairman } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const doc = await Chairman.findOne({}).lean();

        const chairman = doc
            ? { ...doc, id: doc._id }
            : {
                name: { en: '', te: '', hi: '' },
                designation: { en: '', te: '', hi: '' },
                qualification: { en: '', te: '', hi: '' },
                message: { en: '', te: '', hi: '' },
                photo: ''
            };

        return NextResponse.json({ chairman });
    } catch (error) {
        console.error('Chairman GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch chairman' }, { status: 500 });
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
        const { id, ...data } = body;

        if (data.photo) {
            data.photo = await maybeUploadImage(data.photo, 'leaders');
        }

        // Singleton update: There should only ever be one chairman doc
        const updatedDoc = await Chairman.findOneAndUpdate(
            {},
            { ...data, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
 
        revalidatePath('/');
        revalidatePath('/api/chairman');
        return NextResponse.json({ 
            success: true, 
            chairman: { ...updatedDoc, id: updatedDoc._id } 
        });
    } catch (error) {
        console.error('Chairman PUT error:', error);
        return NextResponse.json({ error: 'Failed to update chairman' }, { status: 500 });
    }
}
