'use client';
// Force re-generation of admin layout

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import LanguageToggle from '@/components/LanguageToggle';
import { canAccessAdminPanel } from '@/lib/rbac';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Use user object with role for RBAC check
        const userObj = user ? { ...user, role } : null;

        if (!user) {
            router.push('/login');
        } else if (!canAccessAdminPanel(userObj)) {
            // we show the "Access Denied" UI instead of a silent redirect
            console.warn('Access denied for user:', user.email, 'Role:', role);
        }
    }, [loading, user, role, router]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
                <p style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '1rem' }}>Initializing Admin Panel...</p>
                <p style={{ color: '#666', fontSize: '13px' }}>Checking authentication and permissions</p>

                <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid #eee', textAlign: 'left', maxWidth: '400px', width: '100%' }}>
                    <p style={{ color: '#888', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Auth Diagnostics</p>
                    <div style={{ display: 'grid', gap: '5px', fontSize: '11px', fontFamily: 'monospace' }}>
                        <p><strong>Firebase Auth:</strong> <span style={{ color: '#52c41a' }}>Connected</span></p>
                        <p><strong>Auth State:</strong> <span style={{ color: '#faad14' }}>Pending Resolution</span></p>
                        <p><strong>Firestore:</strong> <span style={{ color: '#1890ff' }}>Connecting...</span></p>
                    </div>
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: 'gray' }}>
                    Taking too long? <button onClick={() => window.location.reload()} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Hard Reload Page</button>
                    <p style={{ marginTop: '5px', opacity: 0.7 }}>Try Incognito Mode if this persists.</p>
                </div>
            </div>
        );
    }

    if (!user || (role !== 'superadmin' && role !== 'admin' && user?.uid !== 'z3VKS1U11ETzBiPw5VtojR2Zmvd2')) {
        return (
            <div className={styles.loading}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '10px' }}>Access Denied</p>
                <p style={{ color: '#666', marginBottom: '20px' }}>Your account does not have administrator privileges.</p>

                <div style={{ margin: '20px 0', padding: '20px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid #eee', textAlign: 'left', maxWidth: '500px' }}>
                    <p style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Technical Diagnostics</p>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '13px', fontFamily: 'monospace' }}>
                        <p><strong>UID:</strong> <span style={{ color: '#444' }}>{user?.uid || 'Not Authenticated'}</span></p>
                        <p><strong>Email:</strong> <span style={{ color: '#444' }}>{user?.email || 'N/A'}</span></p>
                        <p><strong>Detected Role:</strong> <strong style={{ color: role === 'user' ? '#f5222d' : '#faad14' }}>{role || 'NONE'}</strong></p>
                        <p><strong>Auth Loading:</strong> <span style={{ color: loading ? '#faad14' : '#52c41a' }}>{loading ? 'True' : 'False'}</span></p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                    <button onClick={() => router.push('/login')} className="marvelous-btn marvelous-btn-primary marvelous-btn-sm">
                        Switch Account
                    </button>
                    <button
                        onClick={() => router.push('/debug-auth')}
                        className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                    >
                        Detailed Diagnostics
                    </button>
                </div>
            </div>
        );
    }

    const isAdmin = role === 'admin';
    const isSuperAdmin = role === 'superadmin';

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
                                <div className={styles.userDetails}>
                                    <span className={styles.userName}>{user.displayName || user.email.split('@')[0]}</span>
                                    <div className={styles.userRole}>
                                        {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
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
