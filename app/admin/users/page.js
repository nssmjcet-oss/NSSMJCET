'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import styles from '../admin-content.module.css';
import { Icons } from '@/components/Icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsersPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (!authLoading && role !== 'superadmin') {
            console.warn('Unauthorized access attempt to Admin Users page. Role:', role);
            router.push('/admin');
        } else if (!authLoading && role === 'superadmin') {
            fetchUsers();
        }
    }, [authLoading, role, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Creating admin account...' });

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...newUser, role: 'admin' }),
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Admin account created successfully!' });
                setNewUser({ email: '', password: '' });
                setShowAddModal(false);
                fetchUsers();
            } else {
                const data = await response.json();
                setStatus({ type: 'error', message: data.error || 'Failed to create account.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
        }
    };

    const handleDeleteUser = async (uid) => {
        if (uid === user.uid) {
            alert("Compromising yourself? You cannot delete your own Super Admin account.");
            return;
        }

        if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`/api/admin/users/${uid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchUsers();
            } else {
                alert('Failed to delete user.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleResetPassword = async (uid) => {
        const newPassword = prompt("Enter new password for this admin (min 6 characters):");
        if (!newPassword) return;
        if (newPassword.length < 6) {
            alert("Password too short!");
            return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`/api/admin/users/${uid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (response.ok) {
                alert("Password reset successfully!");
            } else {
                alert("Failed to reset password.");
            }
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
                <p>Loading Admin Management...</p>
            </div>
        );
    }

    return (
        <div className={styles.contentSection}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Admin Management</h2>
                    <p className={styles.sectionSubtitle} style={{ color: 'var(--marvel-text-dim)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
                        Manage accounts and permissions (Max 9 Admins)
                    </p>
                </div>
                <button
                    className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                    onClick={() => setShowAddModal(true)}
                    disabled={users.length >= 10}
                >
                    <Icons.Users /> Add New Admin
                </button>
            </div>

            {status.message && (
                <div className={`alert alert-${status.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '20px' }}>
                    {status.message}
                </div>
            )}

            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Email</th>
                                <th className={styles.th}>Role</th>
                                <th className={styles.th}>Created At</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.uid} className={styles.tr}>
                                    <td className={styles.td} style={{ fontWeight: 600 }}>{u.email}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${u.role === 'superadmin' ? styles.badgeSuccess : styles.badgeInfo}`}>
                                            {u.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className={styles.td}>
                                        <div className={styles.btnGroup}>
                                            <button
                                                className={`${styles.btn} ${styles.btnSecondary}`}
                                                onClick={() => handleResetPassword(u.uid)}
                                                title="Reset Password"
                                            >
                                                Reset
                                            </button>
                                            {u.role !== 'superadmin' && (
                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger}`}
                                                    onClick={() => handleDeleteUser(u.uid)}
                                                    title="Delete Admin"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                        <motion.div
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Create Admin Account</h3>
                                <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleAddUser}>
                                <div className={styles.modalBody}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Address</label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            value={newUser.email}
                                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                            required
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Password</label>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            value={newUser.password}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                            required
                                            minLength={6}
                                            placeholder="Min 6 characters"
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="marvelous-btn marvelous-btn-outline marvelous-btn-sm">Cancel</button>
                                    <button type="submit" className="marvelous-btn marvelous-btn-primary marvelous-btn-sm">Create Admin</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
