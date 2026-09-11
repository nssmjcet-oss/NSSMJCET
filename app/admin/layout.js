'use client';

import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import LanguageToggle from '@/components/LanguageToggle';
import AdminPortalGate from './AdminPortalGate';
import { canAccessAdminPanel, isSuperAdmin } from '@/lib/rbac';
import styles from './admin.module.css';
import portalStyles from './portal.module.css';

export default function AdminLayout({ children }) {
    const { user, adminProfile, role, authStatus, loading } = useAuth();

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '1rem', color: '#111827' }}>
                    Initializing NSS Admin Panel...
                </p>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>
                    Verifying administrator credentials & session
                </p>
            </div>
        );
    }

    const userContext = user ? {
        ...user,
        role: adminProfile?.role || role,
        status: adminProfile?.status,
        is_primary: adminProfile?.is_primary === true
    } : null;

    // If unauthenticated, unapproved, or deactivated, show the Admin Portal Gatekeeper
    if (authStatus !== 'authenticated' || !canAccessAdminPanel(userContext)) {
        return <AdminPortalGate />;
    }

    const superAdmin = isSuperAdmin(userContext);

    return (
        <main className="marvelous-theme">
            <div className={styles.adminLayout}>
                <AdminSidebar />
                <div className={styles.mainContent}>
                    <div className={styles.topBar}>
                        <h1 className={styles.pageTitle}>NSS MJCET Admin</h1>
                        <div className={styles.topBarActions}>
                            <LanguageToggle />
                            <div className={styles.userInfo}>
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'Admin'}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid rgba(255, 153, 51, 0.4)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: superAdmin ? '#FF9933' : '#3b82f6',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '14px'
                                    }}>
                                        {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className={styles.userDetails}>
                                    <span className={styles.userName}>
                                        {user.displayName || user.email.split('@')[0]}
                                    </span>
                                    <div className={superAdmin ? portalStyles.primarySuperAdminBadge : portalStyles.adminBadge}>
                                        {superAdmin ? 'PRIMARY SUPER ADMIN' : 'ADMIN'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.contentArea}>
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
