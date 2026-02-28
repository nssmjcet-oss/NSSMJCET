'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './users.module.css';

// ... (keep translations as is)
const translations = {
    en: {
        title: 'User Management',
        createUser: 'Create New User',
        name: 'Name',
        email: 'Email',
        role: 'Role',
        position: 'Position',
        status: 'Status',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        active: 'Active',
        inactive: 'Inactive',
        superAdmin: 'Super Admin',
        member: 'Member',
        loading: 'Loading users...',
        noUsers: 'No users found',
        confirmDelete: 'Are you sure you want to delete this user?',
    },
    te: {
        title: 'వినియోగదారు నిర్వహణ',
        createUser: 'కొత్త వినియోగదారుని సృష్టించండి',
        name: 'పేరు',
        email: 'ఇమెయిల్',
        role: 'పాత్ర',
        position: 'స్థానం',
        status: 'స్థితి',
        actions: 'చర్యలు',
        edit: 'సవరించు',
        delete: 'తొలగించు',
        active: 'క్రియాశీలం',
        inactive: 'నిష్క్రియం',
        superAdmin: 'సూపర్ అడ్మిన్',
        member: 'సభ్యుడు',
        loading: 'వినియోగదారులను లోడ్ చేస్తోంది...',
        noUsers: 'వినియోగదారులు కనుగొనబడలేదు',
        confirmDelete: 'మీరు ఖచ్చితంగా ఈ వినియోగదారుని తొలగించాలనుకుంటున్నారా?',
    },
    hi: {
        title: 'उपयोगकर्ता प्रबंधन',
        createUser: 'नया उपयोगकर्ता बनाएं',
        name: 'नाम',
        email: 'ईमेल',
        role: 'भूमिका',
        position: 'पद',
        status: 'स्थिति',
        actions: 'कार्रवाइयां',
        edit: 'संपादित करें',
        delete: 'हटाएं',
        active: 'सक्रिय',
        inactive: 'निष्क्रिय',
        superAdmin: 'सुपर एडमिन',
        member: 'सदस्य',
        loading: 'उपयोगकर्ता लोड हो रहे हैं...',
        noUsers: 'कोई उपयोगकर्ता नहीं मिला',
        confirmDelete: 'क्या आप वाकई इस उपयोगकर्ता को हटाना चाहते हैं?',
    },
};

export default function UsersPage() {
    const { user, role } = useAuth();
    const { language } = useLanguage();
    const router = useRouter();
    const t = translations[language];

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Check if user is super admin
    useEffect(() => {
        if (!loading && role !== 'superadmin') {
            router.push('/admin');
        }
    }, [role, loading, router]);

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm(t.confirmDelete)) return;

        try {
            const response = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
                <p>{t.loading}</p>
            </div>
        );
    }

    return (
        <div className={styles.usersPage}>
            <div className={styles.header}>
                <h2>{t.title}</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + {t.createUser}
                </button>
            </div>

            {users.length === 0 ? (
                <div className={styles.noData}>
                    <p>{t.noUsers}</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>{t.name}</th>
                                <th>{t.email}</th>
                                <th>{t.role}</th>
                                <th>{t.position}</th>
                                <th>{t.status}</th>
                                <th>{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', background: '#eee' }}>
                                            {user.profilePicture ? <img src={user.profilePicture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', lineHeight: '30px' }}>{user.name[0]}</div>}
                                        </div>
                                    </td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`${styles.badge} ${user.role === 'superadmin' ? styles.badgePrimary : styles.badgeSecondary}`}>
                                            {user.role === 'superadmin' ? t.superAdmin : t.member}
                                        </span>
                                    </td>
                                    <td>{user.position || '-'}</td>
                                    <td>
                                        <span className={`${styles.badge} ${user.isActive ? styles.badgeSuccess : styles.badgeError}`}>
                                            {user.isActive ? t.active : t.inactive}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => setEditingUser(user)}
                                            >
                                                {t.edit}
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                                                onClick={() => handleDelete(user._id)}
                                            >
                                                {t.delete}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateModal && (
                <UserFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchUsers();
                    }}
                />
            )}

            {editingUser && (
                <UserFormModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}

// User Form Modal Component
function UserFormModal({ user, onClose, onSuccess }) {
    const { language } = useLanguage();
    const isEdit = !!user;

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'member',
        position: user?.position || '',
        image: null,
        isActive: user?.isActive ?? true,
        permissions: user?.permissions || {
            pages: {
                events: false,
                announcements: false,
                gallery: false,
                content: false,
                team: false,
                volunteers: false,
                contact: false,
            },
            modules: {
                canCreateEvents: false,
                canEditEvents: false,
                canDeleteEvents: false,
                canCreateAnnouncements: false,
                canEditAnnouncements: false,
                canDeleteAnnouncements: false,
                canUploadGallery: false,
                canDeleteGallery: false,
                canEditContent: false,
            },
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            if (isEdit) data.append('userId', user._id);
            data.append('name', formData.name);
            data.append('email', formData.email);
            if (formData.password) data.append('password', formData.password);
            data.append('role', formData.role);
            data.append('position', formData.position);
            data.append('permissions', JSON.stringify(formData.permissions));
            data.append('isActive', formData.isActive);
            if (formData.image) data.append('image', formData.image);

            const url = '/api/admin/users';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: data,
            });

            const result = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(result.error || 'Failed to save user');
            }
        } catch (err) {
            setError('Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (category, permission) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [category]: {
                    ...formData.permissions[category],
                    [permission]: !formData.permissions[category][permission],
                },
            },
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEdit ? 'Edit User' : 'Create New User'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="form-group">
                        <label className="label">Photo</label>
                        <input
                            type="file"
                            className="input"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                        />
                        {isEdit && user.profilePicture && (
                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>Current: Has Profile Picture</div>
                        )}
                        {/* Note to User: This photo will also be used in the Team section if created. */}
                    </div>

                    <div className="form-group">
                        <label className="label">Name *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Email *</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={isEdit}
                        />
                    </div>

                    {(!isEdit) && (
                        <div className="form-group">
                            <label className="label">Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!isEdit}
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Role *</label>
                        <select
                            className="input"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Position</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="e.g., Documentation Lead, Activity Lead"
                        />
                    </div>

                    {/* Checkbox for Status */}
                    <div className="form-group">
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span>Active Account</span>
                        </label>
                    </div>

                    {formData.role === 'member' && (
                        <div className={styles.permissionsSection}>
                            <h4>Page Permissions</h4>
                            <div className={styles.permissionsGrid}>
                                {Object.keys(formData.permissions.pages).map((page) => (
                                    <label key={page} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.pages[page]}
                                            onChange={() => handlePermissionChange('pages', page)}
                                        />
                                        <span>{page.charAt(0).toUpperCase() + page.slice(1)}</span>
                                    </label>
                                ))}
                            </div>

                            <h4>Module Permissions</h4>
                            <div className={styles.permissionsGrid}>
                                {Object.keys(formData.permissions.modules).map((module) => (
                                    <label key={module} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.modules[module]}
                                            onChange={() => handlePermissionChange('modules', module)}
                                        />
                                        <span>{module.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
