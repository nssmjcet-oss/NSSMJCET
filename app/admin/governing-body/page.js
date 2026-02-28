'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL } from '@/utils/image-compression';

const emptyMember = () => ({
    id: '',
    name: { en: '', te: '', hi: '' },
    designation: { en: '', te: '', hi: '' },
    photo: '',
    linkedin: '',
    order: 0,
});

export default function GoverningBodyAdminPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [editingMember, setEditingMember] = useState(null); // null = list view
    const [formData, setFormData] = useState(emptyMember());

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/governing-body');
            const data = await res.json();
            setMembers(data.members || []);
        } catch (error) {
            console.error('Failed to fetch governing body:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoTranslate = async (field, value) => {
        if (!value || value.trim().length < 3) return;
        setTranslating(true);
        try {
            const [te, hi] = await Promise.all([
                translateText(value, 'te'),
                translateText(value, 'hi'),
            ]);
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    te: prev[field].te || te,
                    hi: prev[field].hi || hi,
                },
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
            const dataURL = await compressImageToDataURL(file, { maxWidth: 800, maxHeight: 800, quality: 0.6 });
            setFormData(prev => ({ ...prev, photo: dataURL }));
        } catch (error) {
            alert('Failed to process image.');
        } finally {
            setUploading(false);
        }
    };

    const updateField = (field, lang, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: value },
        }));
    };

    const openNew = () => {
        setEditingMember('new');
        setFormData({ ...emptyMember(), order: members.length });
    };

    const openEdit = (member) => {
        setEditingMember(member.id);
        setFormData({
            id: member.id,
            name: member.name || { en: '', te: '', hi: '' },
            designation: member.designation || { en: '', te: '', hi: '' },
            photo: member.photo || '',
            linkedin: member.linkedin || '',
            order: member.order ?? 0,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editingMember === 'new' ? 'POST' : 'PUT';
            const res = await fetch('/api/admin/governing-body', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert('Saved successfully!');
                setEditingMember(null);
                fetchMembers();
            } else {
                alert('Failed to save. Please try again.');
            }
        } catch (error) {
            alert('Error saving. Please check console.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this member?')) return;
        try {
            const res = await fetch(`/api/admin/governing-body?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMembers();
            } else {
                alert('Failed to delete.');
            }
        } catch (error) {
            alert('Error deleting.');
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    // Edit / Add Form
    if (editingMember !== null) {
        return (
            <div>
                <div className={styles.pageHeader}>
                    <h2 className={styles.sectionTitle}>
                        {editingMember === 'new' ? 'Add Governing Body Member' : 'Edit Governing Body Member'}
                    </h2>
                    <button
                        onClick={() => setEditingMember(null)}
                        className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                        ← Back to List
                    </button>
                </div>

                {translating && <span style={{ color: 'var(--color-primary-light)', fontSize: '12px', fontWeight: 'bold' }}>Auto-translating...</span>}

                <form onSubmit={handleSubmit} className={styles.card}>
                    {/* Photo */}
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Profile Photo</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {formData.photo && (
                                <img src={formData.photo} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            {uploading && <span>Uploading...</span>}
                        </div>
                    </div>

                    {/* Name */}
                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--marvel-surface)', border: '1px solid var(--marvel-border)', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--marvel-text)' }}>Name</h3>
                        <div className={styles.formGrid}>
                            {['en', 'te', 'hi'].map((lang) => (
                                <div className={styles.formGroup} key={lang}>
                                    <label className={styles.label}>{lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : 'Hindi'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        required={lang === 'en'}
                                        placeholder={lang === 'en' ? 'Full Name' : lang === 'te' ? 'తెలుగు పేరు' : 'हिंदी नाम'}
                                        value={formData.name[lang]}
                                        onChange={(e) => updateField('name', lang, e.target.value)}
                                        onBlur={lang === 'en' ? (e) => handleAutoTranslate('name', e.target.value) : undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Designation */}
                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--marvel-surface)', border: '1px solid var(--marvel-border)', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--marvel-text)' }}>Designation / Role</h3>
                        <div className={styles.formGrid}>
                            {['en', 'te', 'hi'].map((lang) => (
                                <div className={styles.formGroup} key={lang}>
                                    <label className={styles.label}>{lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : 'Hindi'}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        required={lang === 'en'}
                                        placeholder={lang === 'en' ? 'e.g. Secretary' : lang === 'te' ? 'హోదా' : 'पदनाम'}
                                        value={formData.designation[lang]}
                                        onChange={(e) => updateField('designation', lang, e.target.value)}
                                        onBlur={lang === 'en' ? (e) => handleAutoTranslate('designation', e.target.value) : undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LinkedIn Link */}
                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--marvel-surface)', border: '1px solid var(--marvel-border)', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--marvel-text)' }}>Social Links</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>LinkedIn Profile URL</label>
                            <input
                                type="url"
                                className={styles.input}
                                placeholder="https://linkedin.com/in/username"
                                value={formData.linkedin}
                                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Order */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Display Order (lower = appears first)</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.order}
                                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                style={{ maxWidth: '120px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving || uploading}>
                            {saving ? 'Saving...' : 'Save Member'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // List View
    return (
        <div>
            <div className={styles.pageHeader}>
                <h2 className={styles.sectionTitle}>Governing Body</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <p style={{ color: 'var(--color-primary-light)' }}>
                        Manage the Governing Body members displayed on the Home page.
                    </p>
                    <button onClick={openNew} className={`${styles.btn} ${styles.btnPrimary}`}>
                        + Add Member
                    </button>
                </div>
            </div>

            {members.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '3rem', color: 'var(--marvel-text-dim)' }}>
                    No members yet. Click &quot;Add Member&quot; to get started.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {members.map(member => (
                        <div key={member.id} className={styles.card} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {member.photo ? (
                                <img src={member.photo} alt={member.name?.en} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--marvel-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                                    {member.name?.en?.charAt(0) || '?'}
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, color: 'var(--marvel-text)', marginBottom: '0.25rem' }}>{member.name?.en || 'Unnamed'}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--marvel-text-dim)' }}>{member.designation?.en || '—'}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button onClick={() => openEdit(member)} className={`${styles.btn} ${styles.btnSecondary}`} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Edit</button>
                                <button onClick={() => handleDelete(member.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
