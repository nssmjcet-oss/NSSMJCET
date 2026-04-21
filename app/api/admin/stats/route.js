import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, Event, Volunteer } from '@/lib/models';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();

        const [usersCount, eventsCount, pendingVolunteersCount] = await Promise.all([
            User.countDocuments({}),
            Event.countDocuments({}),
            Volunteer.countDocuments({ status: 'pending' })
        ]);

        return NextResponse.json({
            users: usersCount,
            events: eventsCount,
            volunteers: pendingVolunteersCount
        });

    } catch (error) {
        console.error('Admin stats GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
