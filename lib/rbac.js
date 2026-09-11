/**
 * Role-Based Access Control (RBAC) Utilities
 * Two-level administrative authorization model:
 * 1. SUPER_ADMIN: Full website/CMS access + Admin Management
 * 2. ADMIN: Full website/CMS access, NO Admin Management
 */

export const PRIMARY_SUPER_ADMIN_EMAIL = 'nssmjcet@mjcollege.ac.in';

/**
 * Check if user is the Primary Super Admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    const email = (user.email || '').toLowerCase().trim();
    return (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || user.is_primary === true) &&
           (email === PRIMARY_SUPER_ADMIN_EMAIL || user.is_primary === true);
}

/**
 * Check if user is an approved Admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isAdmin(user) {
    if (!user) return false;
    if (user.status === 'INACTIVE') return false;
    const role = (user.role || '').toUpperCase();
    return role === 'ADMIN';
}

/**
 * Check if user can access the Admin Panel at all
 * Must be either an active SUPER_ADMIN or an active ADMIN
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canAccessAdminPanel(user) {
    if (!user) return false;
    if (user.status === 'INACTIVE') return false;
    return isSuperAdmin(user) || isAdmin(user);
}

/**
 * Check if user can manage other administrators
 * Strictly reserved for SUPER_ADMIN
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageUsers(user) {
    return isSuperAdmin(user);
}

/**
 * Check if user can access a specific admin page
 * @param {Object} user - User object
 * @param {string} pageName - Page identifier (e.g., 'events', 'users', 'content')
 * @returns {boolean}
 */
export function canAccessPage(user, pageName) {
    if (!canAccessAdminPanel(user)) return false;

    // Admin user management is strictly for SUPER_ADMIN
    if (pageName === 'users' || pageName === 'admins' || pageName === 'user') {
        return isSuperAdmin(user);
    }

    // All normal CMS pages are accessible to both SUPER_ADMIN and ADMIN
    return true;
}

/**
 * Check if user can edit a specific page
 */
export function canEditPage(user, pageName) {
    return canAccessPage(user, pageName);
}

/**
 * Check if user can edit a specific module
 */
export function canEditModule(user, moduleName) {
    if (!canAccessAdminPanel(user)) return false;
    if (moduleName === 'users' || moduleName === 'admins') {
        return isSuperAdmin(user);
    }
    return true;
}

/**
 * Check if user has permission to perform an action on a resource
 * @param {Object} user - User object
 * @param {string} resource - Resource name ('events', 'content', 'users', etc.)
 * @param {string} action - Action ('create', 'edit', 'delete')
 * @returns {boolean}
 */
export function checkPermission(user, resource, action) {
    if (!canAccessAdminPanel(user)) return false;

    // User management is strictly SUPER_ADMIN
    if (resource === 'users' || resource === 'admins') {
        return isSuperAdmin(user);
    }

    // Full CMS access for both roles
    return true;
}

/**
 * Filter items by ownership (for superadmin and admin, all items visible)
 */
export function filterByOwnership(items, user, ownerField = 'createdBy') {
    if (!user || !canAccessAdminPanel(user)) return [];
    return items;
}
