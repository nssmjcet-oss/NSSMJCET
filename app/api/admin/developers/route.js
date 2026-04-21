import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Developer } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - Get all developers for admin panel
export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const devsData = await Developer.find({}).sort({ order_index: 1 }).lean();
        let developers = devsData.map(doc => ({ ...doc, id: doc._id }));

        const mirza = developers.find(d => d.name?.toLowerCase().includes('zohair'));
        const farnaaz = developers.find(d => d.name?.toLowerCase().includes('farnaaz'));

        if (mirza && farnaaz) {
            developers = developers.filter(d => String(d.id) !== String(mirza.id) && String(d.id) !== String(farnaaz.id));
            developers.splice(1, 0, mirza);
            developers.splice(2, 0, farnaaz);
        }

        return NextResponse.json({ developers }, { status: 200 });
    } catch (error) {
        console.error('Admin Developers GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Add new developer (DISABLED - Section is permanent)
export async function POST(request) {
    return NextResponse.json(
        { error: 'Additions are disabled. The Developers section is a permanent tribute.' },
        { status: 403 }
    );
}

// PUT - Update developer (ONLY Image is editable)
export async function PUT(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { id, image } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const finalImage = await maybeUploadImage(image, 'developers');

        await Developer.findByIdAndUpdate(id, {
            image: finalImage || '',
            updatedAt: new Date(),
        });

        revalidatePath('/');
        revalidatePath('/api/developers');
        return NextResponse.json({ message: 'Developer photo updated' }, { status: 200 });
    } catch (error) {
        console.error('Admin Developers PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove developer (DISABLED - Section is permanent)
export async function DELETE(request) {
    return NextResponse.json(
        { error: 'Deletions are disabled. The Developers section is a permanent tribute.' },
        { status: 403 }
    );
}
