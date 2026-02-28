'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './content.module.css';
import { translateText } from '@/utils/translation';

const PAGES = [
    { id: 'settings', label: 'Site Stats (Impact)' },
    { id: 'unit', label: 'Unit Details' },
];

export default function ContentPage() {
    const { user } = useAuth();
    const [selectedPage, setSelectedPage] = useState('settings');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [translating, setTranslating] = useState(false);

    // Content Data
    const [formData, setFormData] = useState({
        pageId: 'about',
        title: { en: '', te: '', hi: '' },
        content: { en: '', te: '', hi: '' },
        sections: []
    });

    // Settings Data
    const [settingsData, setSettingsData] = useState({
        serviceHours: 5000,
        peopleBenefited: 10000,
        volunteers: 0,
        events: 0
    });

    useEffect(() => {
        if (selectedPage) {
            fetchContent(selectedPage);
        }
    }, [selectedPage]);

    const handleAutoTranslate = async (field, value, index = null) => {
        if (!value || value.trim().length < 5) return;

        setTranslating(true);
        try {
            const [te, hi] = await Promise.all([
                translateText(value, 'te'),
                translateText(value, 'hi')
            ]);

            if (index !== null) {
                // translate inside section
                const newSections = [...formData.sections];
                newSections[index][field] = {
                    ...newSections[index][field],
                    te: newSections[index][field].te || te,
                    hi: newSections[index][field].hi || hi
                };
                setFormData(prev => ({ ...prev, sections: newSections }));
            } else {
                // translate top-level field
                setFormData(prev => ({
                    ...prev,
                    [field]: {
                        ...prev[field],
                        te: prev[field].te || te,
                        hi: prev[field].hi || hi
                    }
                }));
            }
        } catch (err) {
            console.error('Translation failed:', err);
        } finally {
            setTranslating(false);
        }
    };

    const fetchContent = async (pageId) => {
        setLoading(true);
        try {
            if (pageId === 'settings' || pageId === 'unit') {
                const res = await fetch('/api/admin/content?type=settings');
                const data = await res.json();
                if (data.settings) {
                    setSettingsData({
                        serviceHours: data.settings.serviceHours || 5000,
                        peopleBenefited: data.settings.peopleBenefited || 10000,
                        volunteers: data.settings.volunteers || 0,
                        events: data.settings.events || 0
                    });
                }
            }

            if (pageId !== 'settings') {
                const res = await fetch(`/api/admin/content?pageId=${pageId}`);
                const data = await res.json();
                if (data.content) {
                    setFormData(data.content);
                } else {
                    setFormData({
                        pageId: pageId,
                        title: { en: '', te: '', hi: '' },
                        content: { en: '', te: '', hi: '' },
                        sections: []
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch content', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // If it's unit details, we might need to save both content and settings
            if (selectedPage === 'unit') {
                await Promise.all([
                    fetch('/api/admin/content', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'settings', ...settingsData }),
                    }),
                    fetch('/api/admin/content', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'content', ...formData }),
                    })
                ]);
            } else {
                const body = selectedPage === 'settings'
                    ? { type: 'settings', ...settingsData }
                    : { type: 'content', ...formData };

                await fetch('/api/admin/content', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            }

            // Revalidate the public unit page after saving
            await Promise.all([
                fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/unit' }),
                }),
                fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/' }),
                }),
            ]).catch(err => console.log('Revalidation error:', err));

            alert('Saved successfully');
        } catch (error) {
            console.error('Error saving', error);
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    // Helper functions for dynamic sections
    const addSection = () => {
        setFormData({
            ...formData,
            sections: [...formData.sections, { heading: { en: '', te: '', hi: '' }, content: { en: '', te: '', hi: '' } }]
        });
    };

    const removeSection = (index) => {
        const newSections = [...formData.sections];
        newSections.splice(index, 1);
        setFormData({ ...formData, sections: newSections });
    };

    const updateSection = (index, field, lang, value) => {
        const newSections = [...formData.sections];
        newSections[index][field][lang] = value;
        setFormData({ ...formData, sections: newSections });
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h2 className={styles.sectionTitle}>Content Management</h2>
                {translating && <span style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 'bold' }}>Auto-translating...</span>}
            </div>

            <div className={styles.card}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Select Page to Edit</label>
                    <select
                        className={styles.select}
                        value={selectedPage}
                        onChange={(e) => setSelectedPage(e.target.value)}
                    >
                        {PAGES.map(page => (
                            <option key={page.id} value={page.id}>{page.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} className={styles.card}>
                    {selectedPage === 'settings' ? (
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Service Hours (Total Impact)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={settingsData.serviceHours}
                                    onChange={(e) => setSettingsData({ ...settingsData, serviceHours: Number(e.target.value) })}
                                />
                                <small style={{ color: '#666' }}>Auto-calculated from events or manually set here.</small>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>People Benefited</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={settingsData.peopleBenefited}
                                    onChange={(e) => setSettingsData({ ...settingsData, peopleBenefited: Number(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Active Volunteers (Manual Override)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={settingsData.volunteers}
                                    onChange={(e) => setSettingsData({ ...settingsData, volunteers: Number(e.target.value) })}
                                />
                                <small style={{ color: '#666' }}>Set to 0 to use auto-calculation from approved volunteers.</small>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Events Conducted (Manual Override)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={settingsData.events}
                                    onChange={(e) => setSettingsData({ ...settingsData, events: Number(e.target.value) })}
                                />
                                <small style={{ color: '#666' }}>Set to 0 to use auto-calculation from events list.</small>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedPage === 'unit' && (
                                <div className={styles.formGrid} style={{ marginBottom: '2rem', background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                    <h3 style={{ gridColumn: '1/-1', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>Unit Statistics (Impact)</h3>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Active Volunteers</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={settingsData.volunteers}
                                            onChange={(e) => setSettingsData({ ...settingsData, volunteers: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Events Conducted</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={settingsData.events}
                                            onChange={(e) => setSettingsData({ ...settingsData, events: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Service Hours</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={settingsData.serviceHours}
                                            onChange={(e) => setSettingsData({ ...settingsData, serviceHours: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>People Benefited</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={settingsData.peopleBenefited}
                                            onChange={(e) => setSettingsData({ ...settingsData, peopleBenefited: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            )}
                            {selectedPage !== 'unit' && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Page Title (English)</label>
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
                                        <label className={styles.label}>Page Title (Telugu)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.title.te}
                                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Page Title (Hindi)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.title.hi}
                                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, hi: e.target.value } })}
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Main Content (English)</label>
                                        <textarea
                                            className={styles.textarea}
                                            required
                                            style={{ minHeight: '150px' }}
                                            value={formData.content.en}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('content', e.target.value)}
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Main Content (Telugu)</label>
                                        <textarea
                                            className={styles.textarea}
                                            required
                                            style={{ minHeight: '150px' }}
                                            value={formData.content.te}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Main Content (Hindi)</label>
                                        <textarea
                                            className={styles.textarea}
                                            required
                                            style={{ minHeight: '150px' }}
                                            value={formData.content.hi}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, hi: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedPage !== 'unit' && (
                                <div style={{ marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid var(--color-gray-200)', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sections</h3>
                                        <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={addSection}>
                                            + Add Section
                                        </button>
                                    </div>

                                    {formData.sections.map((section, index) => (
                                        <div key={index} style={{ border: '1px solid var(--marvel-border)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                                <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => removeSection(index)}>Remove</button>
                                            </div>
                                            <div className={styles.formGrid}>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Heading (EN)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        value={section.heading.en}
                                                        onChange={(e) => updateSection(index, 'heading', 'en', e.target.value)}
                                                        onBlur={(e) => handleAutoTranslate('heading', e.target.value, index)}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Heading (TE)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        value={section.heading.te}
                                                        onChange={(e) => updateSection(index, 'heading', 'te', e.target.value)}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Heading (HI)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        value={section.heading.hi}
                                                        onChange={(e) => updateSection(index, 'heading', 'hi', e.target.value)}
                                                    />
                                                </div>
                                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                    <label className={styles.label}>Content (EN)</label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={section.content.en}
                                                        onChange={(e) => updateSection(index, 'content', 'en', e.target.value)}
                                                        onBlur={(e) => handleAutoTranslate('content', e.target.value, index)}
                                                    />
                                                </div>
                                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                    <label className={styles.label}>Content (TE)</label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={section.content.te}
                                                        onChange={(e) => updateSection(index, 'content', 'te', e.target.value)}
                                                    />
                                                </div>
                                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                    <label className={styles.label}>Content (HI)</label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={section.content.hi}
                                                        onChange={(e) => updateSection(index, 'content', 'hi', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <div style={{ display: 'flex', justifySelf: 'end', marginTop: '1rem' }}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
