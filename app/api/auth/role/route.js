export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';

/**
 * GET /api/auth/role
 * Legacy/compatibility role check endpoint.
 */
export async function GET(req) {
    try {
        const { user, error, status, code } = await getAuthUser(req);

        if (error) {
            return NextResponse.json(
                { error, code: code || 'UNAUTHORIZED', role: 'NONE' },
                { status: status || 401 }
            );
        }

        return NextResponse.json({
            uid: user.uid,
            email: user.email,
            role: user.role,
            status: user.status,
            is_primary: user.is_primary === true,
            database: 'VERIFIED SERVER-SIDE (MongoDB AdminUser)'
        });

    } catch (error) {
        console.error('Role Check Error:', error);
        return NextResponse.json({ error: error.message, role: 'NONE' }, { status: 500 });
    }
}
