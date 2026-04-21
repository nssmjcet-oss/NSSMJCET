import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';

// Note: For full security, verify ID Token here.

export async function GET() {
    try {
        await connectToDatabase();
        const usersData = await User.find({}).sort({ createdAt: -1 }).lean();

        const users = usersData.map(doc => {
            const { password, ...data } = doc; // remove password if it exists
            return { ...data, id: doc._id };
        });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users: ' + error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectToDatabase();
        const formData = await request.formData();
        const userId = formData.get('userId');
        const name = formData.get('name');
        const role = formData.get('role');
        const position = formData.get('position');
        const isActiveStr = formData.get('isActive');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updateData = {
            name: name || '',
            role: role || 'member',
            position: position || '',
            isActive: isActiveStr === 'true',
            updatedAt: new Date()
        };

        await User.findOneAndUpdate({ uid: userId }, updateData);

        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user: ' + error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await User.deleteOne({ uid: userId });

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user: ' + error.message }, { status: 500 });
    }
}
