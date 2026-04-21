import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Contact } from '@/lib/models';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - Fetch all contact submissions
export async function GET(request) {
    const { user, error, status } = await getAuthUser(request);
    if (error) return NextResponse.json({ error }, { status });
    const rbacError = requireAdmin(user);
    if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

    try {
        await connectToDatabase();
        const contactsData = await Contact.find({}).sort({ submittedAt: -1 }).lean();
        const contacts = contactsData.map(doc => ({ ...doc, id: doc._id }));
        return NextResponse.json({ contacts }, { status: 200 });
    } catch (error) {
        console.error('Contact Admin GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch contact submissions' }, { status: 500 });
    }
}

// PUT - Update contact status
export async function PUT(request) {
    const { user, error, status: authStatus } = await getAuthUser(request);
    if (error) return NextResponse.json({ error }, { status: authStatus });
    const rbacError = requireAdmin(user);
    if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

    try {
        await connectToDatabase();
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
        }

        await Contact.findByIdAndUpdate(id, { status, updatedAt: new Date() });
        return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Contact Admin PUT error:', error);
        return NextResponse.json({ error: 'Failed to update contact status' }, { status: 500 });
    }
}

// DELETE - Delete contact submission
export async function DELETE(request) {
    const { user, error, status } = await getAuthUser(request);
    if (error) return NextResponse.json({ error }, { status });
    const rbacError = requireAdmin(user);
    if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await Contact.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Contact Admin DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete contact submission' }, { status: 500 });
    }
}
