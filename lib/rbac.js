/**
 * Role-Based Access Control (RBAC) Utilities
 * Provides functions to check user permissions for various actions
 */

/**
 * Check if user has permission to perform an action
 * @param {Object} user - User object with role and permissions
 * @param {string} resource - Resource name (e.g., 'events', 'activities')
 * @param {string} action - Action to perform (e.g., 'create', 'edit', 'delete')
 * @returns {boolean} - True if user has permission
 */
export function checkPermission(user, resource, action) {
    if (!user) return false;

    // Super admin has all permissions
    // HARD BYPASS for nssmjcet@mjcollege.ac.in to ensure 100% access
    if (user.role === 'superadmin' || user.uid === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2' || user.id === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2') return true;

    // Check module-level permissions
    const permissionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}${resource.charAt(0).toUpperCase() + resource.slice(1)}`;

    return user.permissions?.modules?.[permissionKey] || false;
}

/**
 * Check if user can access a specific page
 * @param {Object} user - User object with role and permissions
 * @param {string} pageName - Page name (e.g., 'events', 'activities')
 * @returns {boolean} - True if user can access the page
 */
export function canAccessPage(user, pageName) {
    if (!user) return false;

    // Super admin can access all pages
    // HARD BYPASS for nssmjcet@mjcollege.ac.in
    if (user.role === 'superadmin' || user.uid === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2' || user.id === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2') return true;

    // Check page-level permissions
    return user.permissions?.pages?.[pageName] || false;
}

/**
 * Check if user can edit a specific page
 * @param {Object} user - User object with role and permissions
 * @param {string} pageName - Page name
 * @returns {boolean} - True if user can edit the page
 */
export function canEditPage(user, pageName) {
    return canAccessPage(user, pageName);
}

/**
 * Check if user can edit a specific module
 * @param {Object} user - User object with role and permissions
 * @param {string} moduleName - Module name
 * @returns {boolean} - True if user can edit the module
 */
export function canEditModule(user, moduleName) {
    if (!user) return false;

    // Super admin can edit all modules
    if (user.role === 'superadmin') return true;

    // Check if user has any edit permission for this module
    const canEdit = user.permissions?.modules?.[`canEdit${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`];

    return canEdit || false;
}

/**
 * Check if user is super admin
 * @param {Object} user - User object
 * @returns {boolean} - True if user is super admin
 */
export function isSuperAdmin(user) {
    if (!user) return false;
    return user.role === 'superadmin' || user.uid === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2' || user.id === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2';
}

/**
 * Check if user can manage other users (create, edit, delete)
 * @param {Object} user - User object
 * @returns {boolean} - True if user can manage users
 */
export function canManageUsers(user) {
    return isSuperAdmin(user);
}

/**
 * Check if user can access the admin panel at all
 * @param {Object} user - User object
 * @returns {boolean} - True if user has any admin access
 */
export function canAccessAdminPanel(user) {
    if (!user) return false;
    if (user.role === 'superadmin' || user.role === 'admin' || user.uid === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2' || user.id === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2') return true;

    // Check if user has any page access (fallback for custom roles if any)
    const permissions = getUserPermissions(user);
    const hasPageAccess = Object.values(permissions.pages || {}).some(hasAccess => hasAccess);

    return hasPageAccess;
}

/**
 * Get all permissions for a user
 * @param {Object} user - User object
 * @returns {Object} - Object with all permissions
 */
export function getUserPermissions(user) {
    if (!user) return { pages: {}, modules: {} };

    if (user.role === 'superadmin') {
        return {
            pages: {
                announcements: true,
                content: true,
                team: true,
            },
            modules: {
                canCreateEvents: true,
                canEditEvents: true,
                canDeleteEvents: true,
                canCreateActivities: true,
                canEditActivities: true,
                canDeleteActivities: true,
                canCreateAnnouncements: true,
                canEditAnnouncements: true,
                canDeleteAnnouncements: true,
                canEditContent: true,
            },
        };
    }

    // Default permissions for regular Admins if not explicitly set
    if (user.role === 'admin') {
        const defaultAdminPerms = {
            pages: {
                events: true,
                activities: true,
                announcements: true,
                content: true,
                team: true,
                volunteers: true,
                contact: true
            },
            modules: {
                canCreateEvents: true,
                canEditEvents: true,
                canDeleteEvents: false,
                canCreateActivities: true,
                canEditActivities: true,
                canDeleteActivities: false,
                canCreateAnnouncements: true,
                canEditAnnouncements: true,
                canDeleteAnnouncements: false,
                canEditContent: true,
            },
        };

        if (!user.permissions) return defaultAdminPerms;

        // Merge existing permissions with defaults if needed
        return {
            pages: { ...defaultAdminPerms.pages, ...(user.permissions.pages || {}) },
            modules: { ...defaultAdminPerms.modules, ...(user.permissions.modules || {}) }
        };
    }

    return user.permissions || { pages: {}, modules: {} };
}

/**
 * Filter items based on user permissions
 * @param {Array} items - Array of items to filter
 * @param {Object} user - User object
 * @param {string} ownerField - Field name that contains the owner ID
 * @returns {Array} - Filtered items
 */
export function filterByOwnership(items, user, ownerField = 'createdBy') {
    if (!user) return [];

    // Super admin can see all items
    if (user.role === 'superadmin') return items;

    // Members can only see their own items (using Firebase uid)
    return items.filter(item => item[ownerField] === user.uid || item[ownerField] === user.id || item[ownerField] === user._id);
}
