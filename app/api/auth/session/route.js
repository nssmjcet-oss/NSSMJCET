export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';

/**
 * GET /api/auth/session
 * Verifies Firebase token from Authorization header and returns the authenticated admin's verified profile.
 * Handled status responses:
 * - 200: Authorized SUPER_ADMIN or ADMIN
 * - 401: Invalid or missing token
 * - 403: ACCESS_RESTRICTED (unapproved Google account) or ACCOUNT_DEACTIVATED
 */
export async function GET(req) {
    try {
        const { user, error, status, code } = await getAuthUser(req);

        if (error) {
            return NextResponse.json(
                { error, code: code || 'UNAUTHORIZED' },
                { status: status || 401 }
            );
        }

        return NextResponse.json({
            user: {
                id: user.id || user._id,
                uid: user.uid,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                photo_url: user.photo_url || '',
                role: user.role,
                status: user.status,
                is_primary: user.is_primary === true
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Session Verification Error:', error);
        return NextResponse.json(
            { error: 'Internal server error during session verification', code: 'SERVER_ERROR' },
            { status: 500 }
        );
    }
}
