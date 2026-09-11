import { adminAuth } from '@/lib/firebase-admin';
import connectToDatabase from '@/lib/mongodb';
import { AdminUser, User } from '@/lib/models';

export const PRIMARY_SUPER_ADMIN_EMAIL = 'nssmjcet@mjcollege.ac.in';

/**
 * Verifies the authorization header and returns the authenticated user with their MongoDB AdminUser profile.
 * Google authentication alone DOES NOT grant admin access.
 * Only pre-approved accounts in AdminUser with status ACTIVE can access the system.
 * 
 * @param {Request} request The incoming Next.js request object
 * @returns {Promise<{user?: any, error?: string, status?: number, code?: string}>}
 */
export async function getAuthUser(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return { error: 'Unauthorized: Missing or invalid authorization header', status: 401, code: 'UNAUTHORIZED' };
        }

        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken || !adminAuth) {
            return { error: 'Unauthorized: Firebase Admin Auth not configured or token missing', status: 401, code: 'UNAUTHORIZED' };
        }

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const verifiedEmail = (decodedToken.email || '').toLowerCase().trim();

        if (!verifiedEmail) {
            return { error: 'Unauthorized: No verified email in authentication token', status: 401, code: 'NO_EMAIL' };
        }

        await connectToDatabase();
        const AdminModel = AdminUser || User;

        // CASE A: PRIMARY SUPER ADMIN (Permanently nssmjcet@mjcollege.ac.in)
        if (verifiedEmail === PRIMARY_SUPER_ADMIN_EMAIL) {
            let adminProfile = await AdminModel.findOne({ email: PRIMARY_SUPER_ADMIN_EMAIL });

            if (!adminProfile) {
                adminProfile = await AdminModel.create({
                    uid,
                    google_uid: uid,
                    email: PRIMARY_SUPER_ADMIN_EMAIL,
                    name: decodedToken.name || 'NSS MJCET Super Admin',
                    photo_url: decodedToken.picture || '',
                    role: 'SUPER_ADMIN',
                    status: 'ACTIVE',
                    is_primary: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                    last_login: new Date()
                });
            } else {
                // Ensure Primary Super Admin always has role SUPER_ADMIN, status ACTIVE, and is_primary true
                await AdminModel.updateOne(
                    { email: PRIMARY_SUPER_ADMIN_EMAIL },
                    {
                        $set: {
                            uid,
                            google_uid: uid,
                            role: 'SUPER_ADMIN',
                            status: 'ACTIVE',
                            is_primary: true,
                            last_login: new Date(),
                            updated_at: new Date(),
                            ...(decodedToken.name && !adminProfile.name ? { name: decodedToken.name } : {}),
                            ...(decodedToken.picture ? { photo_url: decodedToken.picture } : {})
                        }
                    }
                );
            }

            const doc = adminProfile.toObject ? adminProfile.toObject() : adminProfile;
            return {
                user: {
                    ...doc,
                    id: doc._id?.toString(),
                    uid,
                    google_uid: uid,
                    email: PRIMARY_SUPER_ADMIN_EMAIL,
                    role: 'SUPER_ADMIN',
                    status: 'ACTIVE',
                    is_primary: true,
                    name: doc.name || decodedToken.name || 'NSS MJCET Super Admin',
                    photo_url: doc.photo_url || decodedToken.picture || ''
                }
            };
        }

        // CASE B, C, D: OTHER ACCOUNTS
        // Lookup by email or google_uid
        const adminProfile = await AdminModel.findOne({
            $or: [
                { email: verifiedEmail },
                { google_uid: uid },
                { uid: uid }
            ]
        });

        // CASE C: Google account not approved in database
        if (!adminProfile) {
            return {
                error: 'Access Restricted: Your Google account is not authorized to access the NSS MJCET Admin Portal. Please contact the NSS MJCET Super Admin.',
                status: 403,
                code: 'ACCESS_RESTRICTED'
            };
        }

        // CASE D: Account is deactivated
        if (adminProfile.status === 'INACTIVE') {
            return {
                error: 'Account Deactivated: Your NSS MJCET administrator access has been deactivated. Please contact the Super Admin.',
                status: 403,
                code: 'ACCOUNT_DEACTIVATED'
            };
        }

        // CASE B: Approved ACTIVE ADMIN
        // Update login stats and google_uid
        await AdminModel.updateOne(
            { _id: adminProfile._id },
            {
                $set: {
                    uid,
                    google_uid: uid,
                    last_login: new Date(),
                    updated_at: new Date(),
                    ...(decodedToken.name && !adminProfile.name ? { name: decodedToken.name } : {}),
                    ...(decodedToken.picture ? { photo_url: decodedToken.picture } : {})
                }
            }
        );

        const doc = adminProfile.toObject ? adminProfile.toObject() : adminProfile;
        return {
            user: {
                ...doc,
                id: doc._id?.toString(),
                uid,
                google_uid: uid,
                email: verifiedEmail,
                role: 'ADMIN', // Strictly ADMIN for all non-primary accounts
                status: 'ACTIVE',
                is_primary: false,
                name: doc.name || decodedToken.name || verifiedEmail.split('@')[0],
                photo_url: doc.photo_url || decodedToken.picture || ''
            }
        };

    } catch (error) {
        console.error('getAuthUser error:', error);
        return { error: 'Authentication failed: ' + error.message, status: 401, code: 'AUTH_FAILED' };
    }
}

/**
 * Helper to enforce SUPER_ADMIN role strictly server-side.
 */
export function requireSuperAdmin(user) {
    if (!user) {
        return { error: 'Unauthorized: Authentication required', status: 401, code: 'UNAUTHORIZED' };
    }

    const isSuper = (user.role === 'SUPER_ADMIN' || user.role === 'superadmin') &&
                    (user.email?.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL || user.is_primary === true);

    if (!isSuper) {
        return { error: 'Forbidden: Super Admin access required', status: 403, code: 'FORBIDDEN' };
    }
    return null;
}

/**
 * Helper to enforce ADMIN or SUPER_ADMIN role strictly server-side.
 */
export function requireAdmin(user) {
    if (!user) {
        return { error: 'Unauthorized: Authentication required', status: 401, code: 'UNAUTHORIZED' };
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'superadmin', 'admin'].includes(user.role) &&
                    user.status === 'ACTIVE';

    if (!isAdmin) {
        return { error: 'Forbidden: Admin access required', status: 403, code: 'FORBIDDEN' };
    }
    return null;
}

/**
 * Check if user can manage a CMS resource (all approved ADMIN and SUPER_ADMIN have full CMS access).
 */
export function canManageResource(user, resource) {
    return requireAdmin(user) === null;
}

/**
 * Server-side guard to prevent accidental deletion, deactivation, or demotion of the Primary Super Admin.
 */
export function protectPrimarySuperAdmin(target) {
    if (!target) return null;
    const targetEmail = (typeof target === 'string' ? target : target.email || '').toLowerCase().trim();
    const isPrimary = typeof target === 'object' && target.is_primary === true;

    if (targetEmail === PRIMARY_SUPER_ADMIN_EMAIL || isPrimary) {
        return {
            error: 'Forbidden: The Primary Super Admin account is protected and cannot be modified, deactivated, or deleted.',
            status: 403,
            code: 'PRIMARY_ADMIN_PROTECTED'
        };
    }
    return null;
}
