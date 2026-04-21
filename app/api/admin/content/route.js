import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Content, Stat } from '@/lib/models';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });
        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        if (type === 'settings') {
            const settingsDoc = await Stat.findOne({}).lean();
            if (settingsDoc) {
                return NextResponse.json({ settings: settingsDoc }, { status: 200 });
            } else {
                return NextResponse.json({ settings: { serviceHours: 0, peopleBenefited: 0 } }, { status: 200 });
            }
        }

        const pageId = searchParams.get('pageId');
        if (pageId) {
            // Using findOne({ _id: pageId }) instead of findById(pageId) to avoid CastError for custom string IDs
            const contentDoc = await Content.findOne({ _id: pageId }).lean();
            if (contentDoc) {
                return NextResponse.json({ content: { ...contentDoc, pageId: contentDoc._id } }, { status: 200 });
            } else {
                return NextResponse.json({ content: null }, { status: 200 });
            }
        }

        const allContent = await Content.find({}).lean();
        const contents = allContent.map(doc => ({
            pageId: doc._id,
            title: doc.title,
            updatedAt: doc.updatedAt
        }));

        return NextResponse.json({ contents }, { status: 200 });

    } catch (error) {
        console.error('Error fetching content:', error);
        return NextResponse.json({
            error: 'Failed to fetch content: ' + error.message
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { user, error, status: authStatus } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status: authStatus });
        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { type } = body;

        if (type === 'settings') {
            const { serviceHours, peopleBenefited, volunteers, events } = body;
            await Stat.findOneAndUpdate(
                {},
                { serviceHours, peopleBenefited, volunteers, events, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            revalidatePath('/');
            return NextResponse.json({ message: 'Settings updated' }, { status: 200 });
        }

        const { pageId, title, content, sections } = body;
        if (!pageId) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        // Using findOneAndUpdate with _id: pageId to avoid CastError for custom string IDs like 'about'
        const updated = await Content.findOneAndUpdate(
            { _id: pageId },
            { _id: pageId, title, content, sections, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
 
        revalidatePath('/');
        revalidatePath('/about');
        revalidatePath('/unit');
 
        return NextResponse.json({ 
            message: 'Content updated', 
            content: { ...updated, pageId: updated._id } 
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json({
            error: 'Failed to update content: ' + error.message
        }, { status: 500 });
    }
}
