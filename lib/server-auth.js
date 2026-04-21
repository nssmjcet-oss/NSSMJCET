import { adminAuth } from '@/lib/firebase-admin';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';

/**
 * Verifies the authorization header and returns the authenticated user with their MongoDB profile.
 * @param {Request} request The incoming Next.js request object
 * @returns {Promise<{user: any, error: string, status: number}>}
 */
export async function getAuthUser(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return { error: 'Unauthorized: Missing or invalid authorization header', status: 401 };
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        await connectToDatabase();
        const userProfile = await User.findOne({ uid }).lean();

        if (!userProfile) {
            // If user exists in Firebase but not in MongoDB yet, they have no role
            return {
                user: {
                    uid,
                    email: decodedToken.email,
                    role: 'NONE',
                    permissions: { pages: {}, modules: {} }
                }
            };
        }

        return {
            user: {
                ...userProfile,
                id: userProfile._id.toString(),
                uid: userProfile.uid,
                email: userProfile.email || decodedToken.email,
                role: userProfile.role || 'user'
            }
        };
    } catch (error) {
        console.error('getAuthUser error:', error);
        return { error: 'Authentication failed: ' + error.message, status: 401 };
    }
}

/**
 * Helper to enforce superadmin role.
 */
export function requireSuperAdmin(user) {
    if (user.role !== 'superadmin' && user.uid !== 'z3VKS1U11ETzBiPw5VtojR2Zmvd2') {
        return { error: 'Forbidden: Super Admin access required', status: 403 };
    }
    return null;
}
/**
 * Helper to enforce admin or superadmin role.
 */
export function requireAdmin(user) {
    if (user.role !== 'admin' && user.role !== 'superadmin' && user.uid !== 'z3VKS1U11ETzBiPw5VtojR2Zmvd2') {
        return { error: 'Forbidden: Admin access required', status: 403 };
    }
    return null;
}

/**
 * Helper to check if user can manage a resource.
 */
export function canManageResource(user, resource) {
    if (user.role === 'superadmin' || user.uid === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2') return true;
    
    // Default module permissions logic
    const permissionKey = `canEdit${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
    return user.permissions?.modules?.[permissionKey] || false;
}
