import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Team } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - Get all team members
export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const teamData = await Team.find({}).sort({ order: 1 }).lean();
        
        const team = teamData.map(doc => ({
            ...doc,
            id: doc._id
        }));

        return NextResponse.json({ team }, { status: 200 });
    } catch (error) {
        console.error('Team GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create Team Member
export async function POST(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { name, role, position, email, linkedin, github, image, order } = body;

        if (!name || (!name.en && typeof name !== 'string')) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!role) {
            return NextResponse.json({ error: 'Role is required' }, { status: 400 });
        }

        const teamMemberData = {
            name,
            role,
            position: position || '',
            email: email || '',
            linkedin: linkedin || '',
            github: github || '',
            image: await maybeUploadImage(image, 'team') || '',
            order: order !== undefined ? order : 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const newMember = await Team.create(teamMemberData);

        revalidatePath('/team');
        revalidatePath('/api/team');
        revalidatePath('/api/stats');
        revalidatePath('/');

        return NextResponse.json({ message: 'Team member added', id: newMember._id }, { status: 201 });
    } catch (error) {
        console.error('Team POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update Member
export async function PUT(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        if (data.image) {
            data.image = await maybeUploadImage(data.image, 'team');
        }

        await Team.findByIdAndUpdate(id, {
            ...data,
            updatedAt: new Date(),
        });

        revalidatePath('/team');
        revalidatePath('/api/team');
        revalidatePath('/api/stats');
        revalidatePath('/');

        return NextResponse.json({ message: 'Updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Team PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete Member
export async function DELETE(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await Team.findByIdAndDelete(id);

        revalidatePath('/team');
        revalidatePath('/api/team');
        revalidatePath('/api/stats');
        revalidatePath('/');

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Team DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
