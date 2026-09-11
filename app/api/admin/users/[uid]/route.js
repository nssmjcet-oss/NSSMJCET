export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { AdminUser } from '@/lib/models';
import { getAuthUser, requireSuperAdmin, protectPrimarySuperAdmin, PRIMARY_SUPER_ADMIN_EMAIL } from '@/lib/server-auth';

/**
 * Helper to find an administrator by identifier (MongoDB _id, uid, google_uid, or email)
 */
async function findAdminByIdentifier(identifier) {
    if (!identifier) return null;
    return await AdminUser.findOne({
        $or: [
            { _id: identifier },
            { uid: identifier },
            { google_uid: identifier },
            { email: identifier.toLowerCase().trim() }
        ]
    });
}

/**
 * DELETE /api/admin/users/[uid]
 * Removes an approved administrator.
 * Protected: SUPER_ADMIN only.
 * Primary Super Admin account CANNOT be deleted.
 */
export async function DELETE(req, { params }) {
    const { uid } = params;

    try {
        const { user, error: authError, status: authStatus } = await getAuthUser(req);
        if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

        const rbacError = requireSuperAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();

        const targetAdmin = await findAdminByIdentifier(uid);
        if (!targetAdmin) {
            return NextResponse.json({ error: 'Administrator not found' }, { status: 404 });
        }

        // Enforce Primary Super Admin protection
        const protectionError = protectPrimarySuperAdmin(targetAdmin);
        if (protectionError) {
            return NextResponse.json({ error: protectionError.error }, { status: protectionError.status });
        }

        // Delete from AdminUser collection
        await AdminUser.deleteOne({ _id: targetAdmin._id });

        return NextResponse.json({ message: `Administrator ${targetAdmin.email} removed successfully.` });
    } catch (error) {
        console.error('Admin delete error:', error);
        return NextResponse.json({ error: 'Failed to delete administrator: ' + error.message }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/users/[uid]
 * Updates an administrator's status (ACTIVE / INACTIVE).
 * Protected: SUPER_ADMIN only.
 * Primary Super Admin account CANNOT be modified or deactivated.
 * Role cannot be changed to SUPER_ADMIN.
 */
export async function PATCH(req, { params }) {
    const { uid } = params;

    try {
        const { user, error: authError, status: authStatus } = await getAuthUser(req);
        if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

        const rbacError = requireSuperAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();

        const targetAdmin = await findAdminByIdentifier(uid);
        if (!targetAdmin) {
            return NextResponse.json({ error: 'Administrator not found' }, { status: 404 });
        }

        // Enforce Primary Super Admin protection
        const protectionError = protectPrimarySuperAdmin(targetAdmin);
        if (protectionError) {
            return NextResponse.json({ error: protectionError.error }, { status: protectionError.status });
        }

        const body = await req.json();
        const { status, role } = body;

        // Strictly disallow granting or changing anyone's role to SUPER_ADMIN
        if (role && (role === 'SUPER_ADMIN' || role === 'superadmin')) {
            return NextResponse.json({
                error: 'Forbidden: Cannot assign SUPER_ADMIN role. Exactly one Primary Super Admin is permitted.'
            }, { status: 403 });
        }

        const updateData = { updated_at: new Date() };

        if (status) {
            if (!['ACTIVE', 'INACTIVE'].includes(status)) {
                return NextResponse.json({ error: 'Status must be ACTIVE or INACTIVE.' }, { status: 400 });
            }
            updateData.status = status;
        }

        await AdminUser.updateOne({ _id: targetAdmin._id }, { $set: updateData });

        return NextResponse.json({
            message: `Administrator status updated to ${status || targetAdmin.status}.`,
            user: {
                id: targetAdmin._id.toString(),
                email: targetAdmin.email,
                status: status || targetAdmin.status,
                role: targetAdmin.role
            }
        });

    } catch (error) {
        console.error('Admin patch error:', error);
        return NextResponse.json({ error: 'Failed to update administrator: ' + error.message }, { status: 500 });
    }
}
