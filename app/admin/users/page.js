'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { isSuperAdmin } from '@/lib/rbac';
import styles from '../admin-content.module.css';
import { Icons } from '@/components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { adminFetch } from '@/utils/api-client';

export default function AdminUsersPage() {
    const { user, adminProfile, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ email: '', name: '' });
    const [statusAlert, setStatusAlert] = useState({ type: '', message: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const userContext = user ? {
        ...user,
        role: adminProfile?.role || role,
        is_primary: adminProfile?.is_primary,
        status: adminProfile?.status
    } : null;

    const superAdmin = isSuperAdmin(userContext);

    useEffect(() => {
        if (!authLoading) {
            if (!superAdmin) {
                console.warn('Unauthorized access to Admin Management. Role:', role);
            } else {
                fetchAdmins();
            }
        }
    }, [authLoading, superAdmin, role]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const response = await adminFetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.users || []);
            } else {
                const errData = await response.json();
                setStatusAlert({ type: 'error', message: errData.error || 'Failed to fetch administrators.' });
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            setStatusAlert({ type: 'error', message: 'Failed to connect to administration server.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setStatusAlert({ type: '', message: '' });

        try {
            const response = await adminFetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newAdmin.email,
                    name: newAdmin.name,
                    role: 'ADMIN' // Strictly ADMIN
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatusAlert({ type: 'success', message: `Administrator ${newAdmin.email} added successfully!` });
                setNewAdmin({ email: '', name: '' });
                setShowAddModal(false);
                fetchAdmins();
            } else {
                setStatusAlert({ type: 'error', message: data.error || 'Failed to add administrator.' });
            }
        } catch (error) {
            setStatusAlert({ type: 'error', message: 'An error occurred while adding administrator.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (admin) => {
        if (admin.isProtected || admin.is_primary) {
            alert('The Primary Super Admin account cannot be deactivated.');
            return;
        }

        const newStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const actionVerb = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';

        if (!confirm(`Are you sure you want to ${actionVerb} access for ${admin.email}?`)) {
            return;
        }

        try {
            const response = await adminFetch(`/api/admin/users/${encodeURIComponent(admin.id || admin.email)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();
            if (response.ok) {
                setStatusAlert({ type: 'success', message: `Administrator ${admin.email} is now ${newStatus}.` });
                fetchAdmins();
            } else {
                alert(data.error || 'Failed to update administrator status.');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update administrator status.');
        }
    };

    const handleRemoveAdmin = async (admin) => {
        if (admin.isProtected || admin.is_primary) {
            alert('The Primary Super Admin account cannot be removed.');
            return;
        }

        if (!confirm(`Are you sure you want to remove administrator access for ${admin.email}?\n\nThey will no longer be able to log in to the NSS MJCET Admin Panel.`)) {
            return;
        }

        try {
            const response = await adminFetch(`/api/admin/users/${encodeURIComponent(admin.id || admin.email)}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (response.ok) {
                setStatusAlert({ type: 'success', message: `Administrator ${admin.email} removed.` });
                fetchAdmins();
            } else {
                alert(data.error || 'Failed to remove administrator.');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert('Failed to remove administrator.');
        }
    };

    // If still resolving auth or data
    if (authLoading || (loading && admins.length === 0)) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
                <p>Loading Admin Management...</p>
            </div>
        );
    }

    // Direct access block if non-superadmin manually visits /admin/users
    if (!superAdmin) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #fecaca',
                maxWidth: '600px',
                margin: '40px auto'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                }}>
                    🔒
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
                    Access Denied
                </h2>
                <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                    Admin Management is strictly restricted to the <strong>Primary Super Admin</strong>.
                    <br />
                    Your account has CMS Admin privileges for website content, but cannot manage administrators.
                </p>
                <button
                    onClick={() => router.push('/admin')}
                    className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                >
                    Back to Admin Dashboard
                </button>
            </div>
        );
    }

    const primaryAdmin = admins.find(a => a.is_primary || a.email === 'nssmjcet@mjcollege.ac.in') || {
        email: 'nssmjcet@mjcollege.ac.in',
        name: 'NSS MJCET Super Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        is_primary: true,
        isProtected: true
    };

    const otherAdmins = admins.filter(a => !a.is_primary && a.email !== 'nssmjcet@mjcollege.ac.in');

    return (
        <div className={styles.contentSection}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Admin Management</h2>
                    <p className={styles.sectionSubtitle} style={{ color: 'var(--marvel-text-dim)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
                        Manage approved Google accounts and two-level administrative permissions
                    </p>
                </div>
                <button
                    className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                    onClick={() => {
                        setShowAddModal(true);
                        setStatusAlert({ type: '', message: '' });
                    }}
                >
                    <Icons.Users /> Add Administrator
                </button>
            </div>

            {statusAlert.message && (
                <div className={`alert alert-${statusAlert.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '24px' }}>
                    {statusAlert.message}
                </div>
            )}

            {/* PRIMARY SUPER ADMIN CARD */}
            <div style={{
                background: '#ffffff',
                border: '1.5px solid rgba(255, 153, 51, 0.4)',
                borderRadius: '14px',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(255, 153, 51, 0.08)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FF9933 0%, #e07800 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '18px',
                            boxShadow: '0 2px 8px rgba(255, 153, 51, 0.3)'
                        }}>
                            ★
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{
                                    background: '#FFF7ED',
                                    color: '#B45309',
                                    border: '1px solid #FCD34D',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.5px',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}>
                                    PRIMARY SUPER ADMIN
                                </span>
                                <span style={{
                                    background: '#ECFDF5',
                                    color: '#047857',
                                    border: '1px solid #A7F3D0',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}>
                                    ACTIVE
                                </span>
                                <span style={{
                                    background: '#F3F4F6',
                                    color: '#4B5563',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}>
                                    🔒 Protected
                                </span>
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginTop: '6px' }}>
                                {primaryAdmin.name || 'NSS MJCET Super Admin'}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#4B5563', fontFamily: 'monospace', marginTop: '2px' }}>
                                {primaryAdmin.email}
                            </p>
                        </div>
                    </div>
                </div>
                <div style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    background: '#FDF8F3',
                    border: '1px solid rgba(255, 153, 51, 0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#92400E'
                }}>
                    <strong>Protected System Account:</strong> This account has permanent Super Admin capabilities and cannot be modified, deactivated, or deleted from the Admin Panel.
                </div>
            </div>

            {/* OTHER ADMINISTRATORS TABLE */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                    Other Administrators ({otherAdmins.length})
                </h3>
            </div>

            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Administrator</th>
                                <th className={styles.th}>Role</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Last Login</th>
                                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {otherAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                                        No other administrators configured yet. Click <strong>+ Add Administrator</strong> to approve a Google account.
                                    </td>
                                </tr>
                            ) : (
                                otherAdmins.map((admin) => (
                                    <tr key={admin.id || admin.email} className={styles.tr}>
                                        <td className={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: '#EFF6FF',
                                                    color: '#2563EB',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: '13px'
                                                }}>
                                                    {(admin.name || admin.email)[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#111827' }}>
                                                        {admin.name || admin.email.split('@')[0]}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                                                        {admin.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <span style={{
                                                background: '#EFF6FF',
                                                color: '#1D4ED8',
                                                border: '1px solid #BFDBFE',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                padding: '2px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                ADMIN
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${admin.status === 'ACTIVE' ? styles.badgeSuccess : styles.badgeError}`}>
                                                {admin.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className={styles.td} style={{ fontSize: '13px', color: '#4b5563' }}>
                                            {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never logged in'}
                                        </td>
                                        <td className={styles.td} style={{ textAlign: 'right' }}>
                                            <div className={styles.btnGroup} style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    className={`${styles.btn} ${admin.status === 'ACTIVE' ? styles.btnSecondary : styles.btnSuccess}`}
                                                    onClick={() => handleToggleStatus(admin)}
                                                    title={admin.status === 'ACTIVE' ? 'Deactivate access' : 'Activate access'}
                                                >
                                                    {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                </button>

                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger}`}
                                                    onClick={() => handleRemoveAdmin(admin)}
                                                    title="Remove administrator"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD ADMIN MODAL */}
            <AnimatePresence>
                {showAddModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                        <motion.div
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Add Approved Administrator</h3>
                                <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>×</button>
                            </div>

                            <form onSubmit={handleAddAdmin}>
                                <div className={styles.modalBody}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Google Account Email *</label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            value={newAdmin.email}
                                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            required
                                            placeholder="user@mjcollege.ac.in or user@gmail.com"
                                            autoFocus
                                        />
                                        <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                                            The user will sign in with this Google account to access the Admin Panel.
                                        </span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name (Optional)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={newAdmin.name}
                                            onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                            placeholder="Administrator Name"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Role</label>
                                        <div style={{
                                            padding: '10px 14px',
                                            background: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 700, color: '#1f2937', fontSize: '13px' }}>
                                                ADMIN (Full Website & CMS Access)
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#6b7280', background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>
                                                🔒 Locked
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                                            Super Admin role is permanently reserved for the primary super admin.
                                        </span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Initial Status</label>
                                        <div style={{
                                            padding: '10px 14px',
                                            background: '#ECFDF5',
                                            border: '1px solid #A7F3D0',
                                            borderRadius: '6px',
                                            color: '#047857',
                                            fontWeight: 700,
                                            fontSize: '13px'
                                        }}>
                                            ACTIVE
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? 'Adding...' : 'Add Administrator'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
