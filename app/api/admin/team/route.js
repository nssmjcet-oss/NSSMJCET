export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { Team, TeamSession } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

// GET - Get team members and sessions
export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');

        const query = year ? { academicYear: year } : {};
        const teamData = await Team.find(query).sort({ order: 1 }).lean();
        
        const team = teamData.map(doc => ({
            ...doc,
            id: doc._id
        }));

        const sessions = await TeamSession.find({}).sort({ teamYear: -1 }).lean();
        const currentSession = sessions.find(s => s.status === 'current');
        const currentYear = currentSession?.academicYear || '2025-2026';

        return NextResponse.json({
            team,
            sessions,
            currentYear
        }, { status: 200 });
    } catch (error) {
        console.error('Team GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create Team Member OR Manage Team Sessions
export async function POST(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();

        // 1. Action: Create or Publish New Team Session (Archive/Current workflow)
        if (body.action === 'create_session') {
            const { academicYear, teamType, title, description, publishAsCurrent } = body;
            if (!academicYear) {
                return NextResponse.json({ error: 'Academic year is required (e.g. 2026-2027)' }, { status: 400 });
            }

            // If marked as current, archive all existing sessions first
            if (publishAsCurrent) {
                await TeamSession.updateMany({}, { $set: { status: 'archived', updatedAt: new Date() } });
            }

            const sessionData = {
                teamYear: academicYear,
                academicYear,
                teamType: teamType || 'Governing Body / Execom / Core',
                status: publishAsCurrent ? 'current' : 'archived',
                title: typeof title === 'object' ? title : { en: title || `Team ${academicYear}` },
                description: typeof description === 'object' ? description : { en: description || '' },
                updatedAt: new Date()
            };

            const updatedSession = await TeamSession.findOneAndUpdate(
                { academicYear },
                { $set: sessionData, $setOnInsert: { createdAt: new Date() } },
                { upsert: true, new: true }
            );

            revalidatePath('/team');
            revalidatePath('/team/archive');
            revalidatePath('/');

            return NextResponse.json({ message: 'Session updated', session: updatedSession }, { status: 201 });
        }

        // 2. Action: Set Existing Session as Current
        if (body.action === 'set_current_session') {
            const { academicYear } = body;
            if (!academicYear) {
                return NextResponse.json({ error: 'Academic year required' }, { status: 400 });
            }

            // Set all to archived
            await TeamSession.updateMany({}, { $set: { status: 'archived', updatedAt: new Date() } });

            // Set target to current
            await TeamSession.findOneAndUpdate(
                { academicYear },
                { $set: { status: 'current', updatedAt: new Date() } },
                { upsert: true }
            );

            revalidatePath('/team');
            revalidatePath('/team/archive');
            revalidatePath('/');

            return NextResponse.json({ message: `Session ${academicYear} is now current.` }, { status: 200 });
        }

        // 3. Action: Create Team Member
        const { name, role, position, email, linkedin, github, image, order, academicYear, quote } = body;

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
            academicYear: academicYear || '2025-2026',
            quote: quote || { en: '', te: '', hi: '' },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const newMember = await Team.create(teamMemberData);

        revalidatePath('/team');
        revalidatePath('/team/archive');
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
        revalidatePath('/team/archive');
        revalidatePath('/api/stats');
        revalidatePath('/');

        return NextResponse.json({ message: 'Updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Team PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete Member (Only for mistyped or incorrect entries, not replacing whole team)
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
        revalidatePath('/team/archive');
        revalidatePath('/api/stats');
        revalidatePath('/');

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Team DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
