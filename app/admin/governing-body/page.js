'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';
import { compressImageToDataURL } from '@/utils/image-compression';
import { translateText } from '@/utils/translation';
import { adminFetch } from '@/utils/api-client';

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
            const res = await adminFetch('/api/admin/governing-body');
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
            const res = await adminFetch('/api/admin/governing-body', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert('Saved successfully!');
                setEditingMember(null);
                fetchMembers();
            } else {
                const errorData = await res.json();
                alert(`Failed to save: ${errorData.error || 'Please try again.'}`);
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
            const res = await adminFetch(`/api/admin/governing-body?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMembers();
            } else {
                alert('Failed to delete.');
            }
        } catch (error) {
            alert('Error deleting.');
        }
    };

    if (loading) return (
        <div className={styles.loading}>
            <div className="spinner"></div>
            <p>Loading leadership data...</p>
        </div>
    );

    // Edit / Add Form
    if (editingMember !== null) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>
                            {editingMember === 'new' ? 'New Leadership Profile' : 'Edit Leadership Profile'}
                        </h2>
                        <p className={styles.sectionSubtitle}>Define roles and display priority for organization leaders</p>
                    </div>
                    <button
                        onClick={() => setEditingMember(null)}
                        className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                    >
                        ← Back to List
                    </button>
                </div>

                {translating && (
                    <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                        Auto-translating name and designation...
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.card}>
                    {/* Photo section */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Profile Portrait</label>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ position: 'relative' }}>
                                {formData.photo ? (
                                    <img src={formData.photo} alt="Preview" style={{ width: '120px', height: '120px', borderRadius: '32px', objectFit: 'cover', border: '2px solid #3b82f6', padding: '4px' }} />
                                ) : (
                                    <div style={{ width: '120px', height: '120px', borderRadius: '32px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'rgba(255,255,255,0.2)' }}>
                                        ?
                                    </div>
                                )}
                                {uploading && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', color: 'var(--marvel-text-dim)', marginBottom: '12px' }}>
                                    Recommendation: Square aspect ratio (1:1), max 1MB.
                                </p>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    disabled={uploading}
                                    style={{ color: 'white', fontSize: '14px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
                        {/* Name Section */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Identity (Multilingual)</label>
                            {['en', 'te', 'hi'].map((lang) => (
                                <div key={lang} style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                        {lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : 'Hindi'}
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        required={lang === 'en'}
                                        placeholder="Full Name"
                                        value={formData.name[lang]}
                                        onChange={(e) => updateField('name', lang, e.target.value)}
                                        onBlur={lang === 'en' ? (e) => handleAutoTranslate('name', e.target.value) : undefined}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Designation Section */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Official Role (Multilingual)</label>
                            {['en', 'te', 'hi'].map((lang) => (
                                <div key={lang} style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                        {lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : 'Hindi'}
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        required={lang === 'en'}
                                        placeholder="e.g. Program Officer"
                                        value={formData.designation[lang]}
                                        onChange={(e) => updateField('designation', lang, e.target.value)}
                                        onBlur={lang === 'en' ? (e) => handleAutoTranslate('designation', e.target.value) : undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '32px', marginTop: '20px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>LinkedIn Profile</label>
                            <input
                                type="url"
                                className={styles.input}
                                placeholder="https://linkedin.com/in/username"
                                value={formData.linkedin}
                                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Priority</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.order}
                                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', gap: '16px' }}>
                        <button 
                            type="button" 
                            className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                            onClick={() => setEditingMember(null)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="marvelous-btn marvelous-btn-primary marvelous-btn-sm" 
                            disabled={saving || uploading}
                        >
                            {saving ? 'Saving...' : 'Save leadership profile'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // List View
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Governing Body</h2>
                    <p className={styles.sectionSubtitle}>Manage the organization&apos;s core leadership hierarchy</p>
                </div>
                <button onClick={openNew} className="marvelous-btn marvelous-btn-primary marvelous-btn-sm">
                    <Plus size={18} /> Add New Member
                </button>
            </div>

            {members.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--marvel-text-dim)' }}>
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No leadership profiles found.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {members.map(member => (
                        <div key={member.id} className={styles.gridItem}>
                            <div className={styles.gridContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ position: 'relative', marginBottom: '20px' }}>
                                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', color: 'white', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}>
                                        {member.order}
                                    </div>
                                    {member.photo ? (
                                        <img src={member.photo} alt="" style={{ width: '100px', height: '100px', borderRadius: '32px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    ) : (
                                        <div style={{ width: '100px', height: '100px', borderRadius: '32px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                            {member.name?.en?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
                                    {member.name?.en || 'Unnamed'}
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--marvel-text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                    {member.designation?.en || '—'}
                                </p>

                                {member.linkedin && (
                                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                                        <Icons.LinkedIn size={14} /> Profile
                                    </a>
                                )}
                            </div>
                            
                            <div className={styles.gridActions}>
                                <button onClick={() => openEdit(member)} className={`${styles.btn} ${styles.btnSecondary}`}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(member.id)} className={`${styles.btn} ${styles.btnDanger}`}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper to add icons
function Plus({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}
function Edit2({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
}
function Trash2({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
}
