'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '../admin-content.module.css';
import { compressImage, compressImageToDataURL } from '@/utils/image-compression';
import { translateText } from '@/utils/translation';

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [translating, setTranslating] = useState(false);
    const [formData, setFormData] = useState({
        title: { en: '', te: '', hi: '' },
        content: { en: '', te: '', hi: '' },
        priority: 'medium',
        expiryDate: '',
        isActive: true,
        imageUrl: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleAutoTranslate = async (field, value) => {
        if (!value || value.trim().length < 5) return;

        setTranslating(true);
        try {
            const [te, hi] = await Promise.all([
                translateText(value, 'te'),
                translateText(value, 'hi')
            ]);

            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    te: prev[field].te || te,
                    hi: prev[field].hi || hi
                }
            }));
        } catch (err) {
            console.error('Translation failed:', err);
        } finally {
            setTranslating(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Compress image to Base64 directly for no-cost persistent storage
            const dataUrl = await compressImageToDataURL(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.6
            });

            setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        } catch (err) {
            console.error('Upload Error:', err);
            alert(`Error uploading image: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/admin/announcements');
            const data = await res.json();
            if (data.announcements) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error('Failed to fetch announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingItem ? 'PUT' : 'POST';
            const body = {
                ...formData,
                createdBy: user?.uid || 'admin'
            };
            if (editingItem) body.id = editingItem.id;

            const res = await fetch('/api/admin/announcements', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                // Revalidate the public announcements page and home page
                Promise.all([
                    fetch('/api/revalidate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: '/announcements' }),
                    }),
                    fetch('/api/revalidate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: '/' }),
                    })
                ]).catch(err => console.log('Revalidation error:', err));

                closeModal();
                fetchAnnouncements();
            } else {
                alert('Failed to save announcement');
            }
        } catch (error) {
            console.error('Error saving announcement', error);
            alert('Error saving announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                // Revalidate home page and announcements page
                Promise.all([
                    fetch('/api/revalidate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: '/' }),
                    }),
                    fetch('/api/revalidate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: '/announcements' }),
                    })
                ]).catch(err => console.log('Revalidation error:', err));

                fetchAnnouncements();
            } else {
                alert('Failed to delete announcement');
            }
        } catch (error) {
            console.error('Error deleting announcement', error);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: {
                    en: item.title?.en || '',
                    te: item.title?.te || '',
                    hi: item.title?.hi || ''
                },
                content: {
                    en: item.content?.en || '',
                    te: item.content?.te || '',
                    hi: item.content?.hi || ''
                },
                priority: item.priority,
                expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
                isActive: item.isActive,
                imageUrl: item.imageUrl || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: { en: '', te: '', hi: '' },
                content: { en: '', te: '', hi: '' },
                priority: 'medium',
                expiryDate: '',
                isActive: true,
                imageUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'urgent': return styles.badgeError;
            case 'high': return styles.badgeWarning;
            case 'medium': return styles.badgeInfo;
            default: return styles.badgeSuccess;
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h2 className={styles.sectionTitle}>Announcements</h2>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openModal()}>
                    <span>+</span> Add Announcement
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Title (EN)</th>
                                <th className={styles.th}>Title (TE)</th>
                                <th className={styles.th}>Priority</th>
                                <th className={styles.th}>Expiry</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={styles.emptyState}>No announcements found</td>
                                </tr>
                            ) : (
                                announcements.map((item) => (
                                    <tr key={item.id} className={styles.tr}>
                                        <td className={styles.td}>{item.title.en}</td>
                                        <td className={styles.td}>{item.title.te}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${getPriorityBadgeClass(item.priority)}`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${item.isActive ? styles.badgeSuccess : styles.badgeError}`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.btnGroup}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                                                    onClick={() => openModal(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Delete
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

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingItem ? 'Edit Announcement' : 'New Announcement'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        {translating && <div style={{ padding: '8px 24px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}>Auto-translating to Hindi & Telugu...</div>}
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Title (English)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.title.en}
                                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('title', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Title (Telugu)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.title.te}
                                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Title (Hindi)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.title.hi}
                                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, hi: e.target.value } })}
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Content (English)</label>
                                        <textarea
                                            className={styles.textarea}
                                            required
                                            value={formData.content.en}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('content', e.target.value)}
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Content (Telugu)</label>
                                        <textarea
                                            className={styles.textarea}
                                            required
                                            value={formData.content.te}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Content (Hindi)</label>
                                        <textarea
                                            className={styles.textarea}
                                            required
                                            value={formData.content.hi}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, hi: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Priority</label>
                                        <select
                                            className={styles.select}
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Expiry Date</label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Status</label>
                                        <select
                                            className={styles.select}
                                            value={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Announcement Image</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {formData.imageUrl && (
                                                <div style={{ position: 'relative', width: 'fit-content' }}>
                                                    <img
                                                        src={formData.imageUrl}
                                                        alt="Preview"
                                                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', border: '1px solid var(--marvel-border)' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                        style={{
                                                            position: 'absolute', top: '-10px', right: '-10px',
                                                            background: '#ef4444', color: 'white', border: 'none',
                                                            borderRadius: '50%', width: '24px', height: '24px',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', fontSize: '14px', fontWeight: 'bold',
                                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                                                        }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            )}
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                    id="announcement-image-upload"
                                                    disabled={uploading}
                                                />
                                                <label
                                                    htmlFor="announcement-image-upload"
                                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                                    style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, width: 'fit-content' }}
                                                >
                                                    {uploading ? 'Uploading...' : formData.imageUrl ? 'Change Image' : 'Upload Image'}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save Announcement</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
