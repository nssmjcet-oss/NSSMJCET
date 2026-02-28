'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL } from '@/utils/image-compression';

export default function TeamPage() {
    const { user } = useAuth();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [formData, setFormData] = useState({
        name: { en: '', te: '', hi: '' },
        role: 'Core',
        position: { en: '', te: '', hi: '' },
        email: '',
        linkedin: '',
        github: '',
        image: '',
        order: 0
    });

    const handleAutoTranslate = async (field, value) => {
        if (!value || value.trim().length < 3) return;

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

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await fetch('/api/admin/team');
            const data = await res.json();
            if (data.team) {
                setTeam(data.team);
            }
        } catch (error) {
            console.error('Failed to fetch team', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Compress & convert to Base64 — no Firebase Storage upload needed
            const dataURL = await compressImageToDataURL(file, { maxWidth: 800, maxHeight: 800, quality: 0.6 });
            setFormData(prev => ({ ...prev, image: dataURL }));
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };
            if (editingMember) payload.id = editingMember.id;

            const method = editingMember ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/team', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // Revalidate the public team page (non-blocking)
                fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/team' }),
                }).catch(err => console.log('Revalidation error:', err));

                closeModal();
                fetchTeam();
            } else {
                alert('Failed to save team member');
            }
        } catch (error) {
            console.error('Error saving team member', error);
            alert('Error saving team member');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this member?")) return;
        try {
            const res = await fetch(`/api/admin/team?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchTeam();
            else alert("Failed to delete");
        } catch (e) {
            alert("Error deleting");
        }
    };

    const openModal = (member = null) => {
        setEditingMember(member);
        setFormData({
            name: typeof member?.name === 'object' ? {
                en: member.name.en || '',
                te: member.name.te || '',
                hi: member.name.hi || ''
            } : { en: member?.name || '', te: '', hi: '' },
            role: member?.role || 'GB',
            position: typeof member?.position === 'object' ? {
                en: member.position.en || '',
                te: member.position.te || '',
                hi: member.position.hi || ''
            } : { en: member?.position || '', te: '', hi: '' },
            email: member?.email || '',
            linkedin: member?.linkedin || '',
            github: member?.github || '',
            image: member?.image || '',
            order: member?.order || 0
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h2 className={styles.sectionTitle}>Team Management</h2>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => openModal()}>+ Add Member</button>
            </div>

            <div className={styles.card}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Image</th>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Category</th>
                                <th className={styles.th}>Position</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className={styles.emptyState}>No team members found</td>
                                </tr>
                            ) : (
                                team.map((member) => (
                                    <tr key={member.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#eee' }}>
                                                {member.image ? (
                                                    <img src={member.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px' }}>{(typeof member.name === 'object' ? (member.name.en || '') : member.name).charAt(0)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.td}>{typeof member.name === 'object' ? member.name.en : member.name}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${styles.badgeInfo}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{typeof member.position === 'object' ? member.position.en : (member.position || '-')}</td>
                                        <td className={styles.td}>
                                            <button
                                                className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                                                style={{ marginRight: '8px' }}
                                                onClick={() => openModal(member)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                                                style={{ backgroundColor: '#ff4d4f', color: 'white', borderColor: 'transparent' }}
                                                onClick={() => handleDelete(member.id)}
                                            >
                                                Delete
                                            </button>
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
                            <h3 className={styles.modalTitle}>{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {translating && <div style={{ padding: '8px 20px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}>Auto-translating to Hindi & Telugu...</div>}
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Name (English) *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.name.en}
                                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('name', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Name (Telugu)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.name.te}
                                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Name (Hindi)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.name.hi}
                                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, hi: e.target.value } })}
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Group / Category *</label>
                                        <select
                                            className={styles.input}
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            required
                                            style={{ appearance: 'auto' }}
                                        >
                                            <option value="GB">Governing Body (GB)</option>
                                            <option value="Execom">Executive Committee (Execom)</option>
                                            <option value="Core">Core Members</option>
                                        </select>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Position (English)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g. Activity Lead"
                                            value={formData.position.en}
                                            onChange={(e) => setFormData({ ...formData, position: { ...formData.position, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('position', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Position (Telugu)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.position.te}
                                            onChange={(e) => setFormData({ ...formData, position: { ...formData.position, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Position (Hindi)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.position.hi}
                                            onChange={(e) => setFormData({ ...formData, position: { ...formData.position, hi: e.target.value } })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>LinkedIn URL</label>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            placeholder="https://linkedin.com/in/username"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>GitHub URL</label>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            placeholder="https://github.com/username"
                                            value={formData.github}
                                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Order</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className={styles.input}
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        {uploading && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Processing image...</div>}
                                        {formData.image && (
                                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#aaa' }}>Image uploaded</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving || uploading}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
