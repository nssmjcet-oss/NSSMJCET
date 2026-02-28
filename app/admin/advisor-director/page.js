'use client';
// Force chunk re-generation for advisor

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL } from '@/utils/image-compression';

export default function AdvisorDirectorAdminPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: { en: '', te: '', hi: '' },
        designation: { en: '', te: '', hi: '' },
        qualification: { en: '', te: '', hi: '' },
        message: { en: '', te: '', hi: '' },
        photo: '',
    });

    useEffect(() => {
        fetchAdvisor();
    }, []);

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

    const fetchAdvisor = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/advisor-director');
            const data = await res.json();
            if (data.advisor) {
                setFormData({
                    id: data.advisor.id || '',
                    name: data.advisor.name || { en: '', te: '', hi: '' },
                    designation: data.advisor.designation || { en: '', te: '', hi: '' },
                    qualification: data.advisor.qualification || { en: '', te: '', hi: '' },
                    message: data.advisor.message || { en: '', te: '', hi: '' },
                    photo: data.advisor.photo || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch advisor director', error);
        } finally {
            setLoading(false);
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
            const res = await fetch('/api/admin/advisor-director', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert('Advisor cum Director information saved successfully!');
            } else {
                alert('Failed to save. Please try again.');
            }
        } catch (error) {
            console.error('Error saving advisor director', error);
            alert('Error saving. Please check console.');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, lang, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [lang]: value },
        }));
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h2 className={styles.sectionTitle}>Advisor cum Director</h2>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <p style={{ color: 'var(--color-primary-light)', marginTop: '0.5rem' }}>
                        Manage the Advisor cum Director profile displayed on the Home page.
                    </p>
                    {translating && <span style={{ color: 'var(--color-primary-light)', fontSize: '12px', fontWeight: 'bold' }}>Auto-translating...</span>}
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.card}>
                {/* Photo Upload */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Profile Photo</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {formData.photo && (
                            <img src={formData.photo} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        {uploading && <span>Uploading...</span>}
                    </div>
                </div>

                {/* Name */}
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--marvel-surface)', border: '1px solid var(--marvel-border)', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--marvel-text)' }}>Name</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>English</label>
                            <input
                                type="text"
                                className={styles.input}
                                required
                                placeholder="Advisor Name"
                                value={formData.name.en}
                                onChange={(e) => updateField('name', 'en', e.target.value)}
                                onBlur={(e) => handleAutoTranslate('name', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Telugu</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="తెలుగు పేరు"
                                value={formData.name.te}
                                onChange={(e) => updateField('name', 'te', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Hindi</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="हिंदी नाम"
                                value={formData.name.hi}
                                onChange={(e) => updateField('name', 'hi', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Qualification */}
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--marvel-surface)', border: '1px solid var(--marvel-border)', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--marvel-text)' }}>Qualification</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>English</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="e.g. Ph.D."
                                value={formData.qualification.en}
                                onChange={(e) => updateField('qualification', 'en', e.target.value)}
                                onBlur={(e) => handleAutoTranslate('qualification', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Telugu</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="అర్హత"
                                value={formData.qualification.te}
                                onChange={(e) => updateField('qualification', 'te', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Hindi</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="योग्यता"
                                value={formData.qualification.hi}
                                onChange={(e) => updateField('qualification', 'hi', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Designation */}
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--marvel-surface)', border: '1px solid var(--marvel-border)', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--marvel-text)' }}>Designation</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>English</label>
                            <input
                                type="text"
                                className={styles.input}
                                required
                                placeholder="Advisor cum Director"
                                value={formData.designation.en}
                                onChange={(e) => updateField('designation', 'en', e.target.value)}
                                onBlur={(e) => handleAutoTranslate('designation', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Telugu</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="తెలుగు హోదా"
                                value={formData.designation.te}
                                onChange={(e) => updateField('designation', 'te', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Hindi</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="हिंदी पदनाम"
                                value={formData.designation.hi}
                                onChange={(e) => updateField('designation', 'hi', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--marvel-surface)', border: '1px solid var(--marvel-border)', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--marvel-text)' }}>Message / Quote (optional)</h3>
                    <div className={styles.formGrid}>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>English</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                placeholder="A short inspiring message..."
                                value={formData.message.en}
                                onChange={(e) => updateField('message', 'en', e.target.value)}
                                onBlur={(e) => handleAutoTranslate('message', e.target.value)}
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Telugu</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                placeholder="తెలుగు సందేశం..."
                                value={formData.message.te}
                                onChange={(e) => updateField('message', 'te', e.target.value)}
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Hindi</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                placeholder="हिंदी संदेश..."
                                value={formData.message.hi}
                                onChange={(e) => updateField('message', 'hi', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        disabled={saving || uploading}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
