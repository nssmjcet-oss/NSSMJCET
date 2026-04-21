import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Portal } from '@/lib/models';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const portalsData = await Portal.find({}).sort({ createdAt: -1 }).lean();
        const portals = portalsData.map(doc => ({ ...doc, id: doc._id }));
        return NextResponse.json({ portals }, { status: 200 });
    } catch (error) {
        console.error('Admin Portals GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portals: ' + error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const data = await request.json();

        if (!data.title?.en || !data.url) {
            return NextResponse.json(
                { error: 'Title and URL are required' },
                { status: 400 }
            );
        }

        const newPortal = await Portal.create({ ...data, createdAt: new Date() });
        return NextResponse.json(
            { message: 'Portal added successfully', id: newPortal._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Admin Portals POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create portal: ' + error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const data = await request.json();

        if (!data.id) {
            return NextResponse.json({ error: 'Portal ID is required' }, { status: 400 });
        }

        const { id, ...updateData } = data;
        updateData.updatedAt = new Date();
 
        // Ensure id is a simple string if it's a serialized ObjectId object
        const portalId = typeof id === 'object' ? (id.$oid || id.toString()) : id;
 
        let updated = null;
 
        // 1. Try as ObjectId if valid
        if (typeof portalId === 'string' && portalId.length === 24) {
            try {
                updated = await Portal.findByIdAndUpdate(
                    new mongoose.Types.ObjectId(portalId),
                    updateData,
                    { new: true }
                ).lean();
            } catch (e) {
                console.log('Portal ObjectId update failed, trying string format...');
            }
        }
 
        // 2. Try as string
        if (!updated) {
            updated = await Portal.findOneAndUpdate(
                { _id: portalId },
                updateData,
                { new: true }
            ).lean();
        }
        
        if (!updated) {
            return NextResponse.json({ error: 'Portal not found in database with ID: ' + portalId }, { status: 404 });
        }
 
        return NextResponse.json({ 
            message: 'Portal updated successfully',
            portal: { ...updated, id: updated._id.toString() }
        }, { status: 200 });
    } catch (error) {
        console.error('Admin Portals PUT error:', error);
        return NextResponse.json(
            { error: 'Failed to update portal: ' + error.message },
            { status: 500 }
        );
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

        if (!id) {
            return NextResponse.json({ error: 'Portal ID is required' }, { status: 400 });
        }

        await Portal.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Portal deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Admin Portals DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete portal: ' + error.message },
            { status: 500 }
        );
    }
}
