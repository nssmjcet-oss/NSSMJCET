export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { AdminUser } from '@/lib/models';
import { getAuthUser, requireSuperAdmin, PRIMARY_SUPER_ADMIN_EMAIL } from '@/lib/server-auth';

/**
 * GET /api/admin/users
 * Returns all administrators. Protected: SUPER_ADMIN only.
 */
export async function GET(req) {
    try {
        const { user, error, status } = await getAuthUser(req);
        if (error) return NextResponse.json({ error }, { status });

        const authError = requireSuperAdmin(user);
        if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

        await connectToDatabase();

        // Fetch all administrators from AdminUser collection
        const admins = await AdminUser.find({})
            .sort({ is_primary: -1, created_at: -1 })
            .lean();

        const formattedAdmins = admins.map(admin => ({
            id: admin._id?.toString(),
            uid: admin.uid || admin.google_uid || admin._id?.toString(),
            email: admin.email,
            name: admin.name || admin.email.split('@')[0],
            photo_url: admin.photo_url || '',
            role: admin.role,
            status: admin.status || 'ACTIVE',
            is_primary: admin.is_primary === true || admin.email === PRIMARY_SUPER_ADMIN_EMAIL,
            isProtected: admin.is_primary === true || admin.email === PRIMARY_SUPER_ADMIN_EMAIL,
            createdAt: admin.created_at,
            lastLogin: admin.last_login
        }));

        return NextResponse.json({ users: formattedAdmins });
    } catch (error) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch administrators' }, { status: 500 });
    }
}

/**
 * POST /api/admin/users
 * Creates a new ADMIN account. Protected: SUPER_ADMIN only.
 * Strictly creates role = ADMIN. Creating another SUPER_ADMIN is prohibited.
 */
export async function POST(req) {
    try {
        const { user, error: authError, status: authStatus } = await getAuthUser(req);
        if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

        const rbacError = requireSuperAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await req.json();
        const { email, name } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
        }

        // Cannot add the primary super admin
        if (normalizedEmail === PRIMARY_SUPER_ADMIN_EMAIL) {
            return NextResponse.json({ error: 'The Primary Super Admin account already exists and is protected.' }, { status: 400 });
        }

        // Check if admin already exists
        const existingAdmin = await AdminUser.findOne({ email: normalizedEmail });
        if (existingAdmin) {
            return NextResponse.json({ error: 'An administrator with this email already exists.' }, { status: 400 });
        }

        // Create new Admin record: Role is strictly ADMIN, status is ACTIVE, is_primary is false
        const newAdmin = await AdminUser.create({
            email: normalizedEmail,
            name: (name || '').trim(),
            role: 'ADMIN',
            status: 'ACTIVE',
            is_primary: false,
            created_at: new Date(),
            updated_at: new Date(),
            last_login: null
        });

        return NextResponse.json({
            message: 'Administrator added successfully.',
            user: {
                id: newAdmin._id.toString(),
                email: newAdmin.email,
                name: newAdmin.name,
                role: newAdmin.role,
                status: newAdmin.status,
                is_primary: false
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Admin users POST error:', error);
        return NextResponse.json({ error: error.message || 'Failed to add administrator' }, { status: 500 });
    }
}
