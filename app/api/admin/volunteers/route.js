import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Volunteer } from '@/lib/models';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - Fetch all volunteers
export async function GET(request) {
    const { user, error, status } = await getAuthUser(request);
    if (error) return NextResponse.json({ error }, { status });
    const rbacError = requireAdmin(user);
    if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });
    try {
        await connectToDatabase();
        const volunteersData = await Volunteer.find({}).sort({ submittedAt: -1 }).lean();
        const volunteers = volunteersData.map(doc => ({ ...doc, id: doc._id }));
        return NextResponse.json({ volunteers }, { status: 200 });
    } catch (error) {
        console.error('Volunteer Admin GET error:', error);
        return NextResponse.json({
            error: 'Failed to fetch volunteers: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// PUT - Update volunteer status
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

        await Volunteer.findByIdAndUpdate(id, { status, updatedAt: new Date() });

        revalidatePath('/api/stats');
        revalidatePath('/');

        return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Volunteer Admin PUT error:', error);
        return NextResponse.json({
            error: 'Failed to update volunteer: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// DELETE - Delete volunteer
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

        await Volunteer.findByIdAndDelete(id);

        revalidatePath('/api/stats');
        revalidatePath('/');

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Volunteer Admin DELETE error:', error);
        return NextResponse.json({
            error: 'Failed to delete volunteer: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
