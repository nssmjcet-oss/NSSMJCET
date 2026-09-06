'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '../admin-content.module.css';
import { Icons } from '@/components/Icons';
import { adminFetch } from '@/utils/api-client';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL } from '@/utils/image-compression';

const PAGES = [
    { id: 'settings', label: 'Unit Stats (Dashboard)' },
    { id: 'hero', label: 'Homepage Hero' },
    { id: 'volunteer_gallery', label: 'Volunteer Portal — Service in Motion' },
    { id: 'live_event', label: 'Featured Spotlight / Live Event (Home)' },
    { id: 'about', label: 'About Section' },
    { id: 'vision', label: 'Vision & Mission' },
    { id: 'objectives', label: 'NSS Objectives' },
    { id: 'unit', label: 'Unit Information' },
];

export default function ContentPage() {
    const { user } = useAuth();
    const [selectedPage, setSelectedPage] = useState('settings');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [eventsList, setEventsList] = useState([]);

    // Content Data
    const [formData, setFormData] = useState({
        pageId: 'about',
        title: { en: '', te: '', hi: '' },
        content: { en: '', te: '', hi: '' },
        subtitle: { en: '', te: '', hi: '' },
        btnText: { en: '', te: '', hi: '' },
        btnLink: '',
        image: '',
        isActive: false,
        volunteers: 500,
        events: 50,
        serviceHours: 10000,
        sections: []
    });

    // Settings Data
    const [settingsData, setSettingsData] = useState({
        serviceHours: 10000,
        peopleBenefited: 10000,
        volunteers: 500,
        events: 50
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

    const handleLiveEventImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        // Validate portrait orientation (height must be greater than width)
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            const width = img.width;
            const height = img.height;
            URL.revokeObjectURL(img.src);

            if (height <= width) {
                alert('Please upload a portrait image (height must be greater than width).');
                e.target.value = ''; // Reset input
                return;
            }

            setUploading(true);
            try {
                // Compress & convert to Base64
                const dataURL = await compressImageToDataURL(file, { maxWidth: 600, maxHeight: 900, quality: 0.7 });
                setFormData(prev => ({ ...prev, image: dataURL }));
            } catch (error) {
                console.error('Error processing image:', error);
                alert('Failed to process image.');
            } finally {
                setUploading(false);
            }
        };
    };

    const handleHeroImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        setUploading(true);
        try {
            const dataURL = await compressImageToDataURL(file, { maxWidth: 1400, maxHeight: 950, quality: 0.8 });
            setFormData(prev => ({ ...prev, image: dataURL }));
        } catch (error) {
            console.error('Error processing hero image:', error);
            alert('Failed to process image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSelectEventForSlot = (slotIndex, eventId) => {
        const found = eventsList.find(e => (e.id || e._id) === eventId);
        const updated = [...(formData.sections || [])];
        while (updated.length < 5) {
            updated.push({ eventId: '', title: { en: '' }, subtitle: { en: '' }, image: '' });
        }

        if (!found) {
            updated[slotIndex] = {
                ...updated[slotIndex],
                eventId: '',
            };
        } else {
            const eventImg = (found.images && found.images.length > 0) ? found.images[0] : '';
            const titleEn = typeof found.title === 'object' ? (found.title?.en || '') : (found.title || '');
            const category = found.category || 'NSS MJCET Initiative';
            const year = found.academicYear || '';
            const subtitleEn = year ? `${category} (${year})` : category;

            updated[slotIndex] = {
                ...updated[slotIndex],
                eventId: eventId,
                title: { en: titleEn, te: typeof found.title === 'object' ? found.title?.te || '' : '', hi: typeof found.title === 'object' ? found.title?.hi || '' : '' },
                subtitle: { en: subtitleEn },
                image: eventImg || updated[slotIndex].image || ''
            };
        }
        setFormData(prev => ({ ...prev, sections: updated }));
    };

    const handleSlotImageUpload = async (slotIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        setUploading(true);
        try {
            const dataURL = await compressImageToDataURL(file, { maxWidth: 1200, maxHeight: 900, quality: 0.8 });
            const updated = [...(formData.sections || [])];
            while (updated.length < 5) {
                updated.push({ eventId: '', title: { en: '' }, subtitle: { en: '' }, image: '' });
            }
            updated[slotIndex] = {
                ...updated[slotIndex],
                image: dataURL
            };
            setFormData(prev => ({ ...prev, sections: updated }));
        } catch (err) {
            console.error('Error processing slot image:', err);
            alert('Failed to process image.');
        } finally {
            setUploading(false);
        }
    };

    const fetchContent = async (pageId) => {
        setLoading(true);
        try {
            if (pageId === 'settings' || pageId === 'unit') {
                const res = await adminFetch('/api/admin/content?type=settings');
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

            if (pageId === 'volunteer_gallery') {
                try {
                    const evRes = await fetch('/api/events');
                    const evData = await evRes.json();
                    if (evData.events) {
                        setEventsList(evData.events);
                    }
                } catch (e) {
                    console.error('Failed to load events for gallery:', e);
                }
            }

            if (pageId !== 'settings') {
                const res = await adminFetch(`/api/admin/content?pageId=${pageId}`);
                const data = await res.json();
                if (data.content) {
                    let sections = data.content.sections || [];
                    if (pageId === 'volunteer_gallery' && (!sections || sections.length < 5)) {
                        const defaults = [
                            { eventId: '', title: { en: 'Campus Induction & Assemblies' }, subtitle: { en: 'Welcoming 250+ engineering student volunteers' }, image: '/uploads/nss-team-hero.jpg' },
                            { eventId: '', title: { en: 'Mega Blood Donation Drives' }, subtitle: { en: '300+ units collected for Red Cross' }, image: '/uploads/events/1772212213205-20251110130725.jpg' },
                            { eventId: '', title: { en: 'Rural Immersion & Healthcare' }, subtitle: { en: 'Transforming village communities' }, image: '/uploads/events/1772212213224-20251110145020.jpg' },
                            { eventId: '', title: { en: 'Awareness & Civic Drives' }, subtitle: { en: 'Traffic, cyber safety, and health rallies' }, image: '/uploads/events/1772212567791-NSS01-3.jpg' },
                            { eventId: '', title: { en: 'Flagship Summits (MUNX NSS)' }, subtitle: { en: 'National student diplomatic assemblies' }, image: '/uploads/events/1772258937302-DSC90851.jpg' }
                        ];
                        sections = defaults.map((d, i) => sections[i] || d);
                    }
                    setFormData({
                        pageId: pageId,
                        title: data.content.title || { en: '', te: '', hi: '' },
                        content: data.content.content || { en: '', te: '', hi: '' },
                        subtitle: data.content.subtitle || { en: '', te: '', hi: '' },
                        btnText: data.content.btnText || { en: '', te: '', hi: '' },
                        btnLink: data.content.btnLink || '',
                        image: data.content.image || '',
                        isActive: data.content.isActive !== undefined ? data.content.isActive : false,
                        volunteers: data.content.volunteers !== undefined ? data.content.volunteers : 500,
                        events: data.content.events !== undefined ? data.content.events : 50,
                        serviceHours: data.content.serviceHours !== undefined ? data.content.serviceHours : 10000,
                        sections: sections
                    });
                } else {
                    const defaultSections = pageId === 'volunteer_gallery' ? [
                        { eventId: '', title: { en: 'Campus Induction & Assemblies' }, subtitle: { en: 'Welcoming 250+ engineering student volunteers' }, image: '/uploads/nss-team-hero.jpg' },
                        { eventId: '', title: { en: 'Mega Blood Donation Drives' }, subtitle: { en: '300+ units collected for Red Cross' }, image: '/uploads/events/1772212213205-20251110130725.jpg' },
                        { eventId: '', title: { en: 'Rural Immersion & Healthcare' }, subtitle: { en: 'Transforming village communities' }, image: '/uploads/events/1772212213224-20251110145020.jpg' },
                        { eventId: '', title: { en: 'Awareness & Civic Drives' }, subtitle: { en: 'Traffic, cyber safety, and health rallies' }, image: '/uploads/events/1772212567791-NSS01-3.jpg' },
                        { eventId: '', title: { en: 'Flagship Summits (MUNX NSS)' }, subtitle: { en: 'National student diplomatic assemblies' }, image: '/uploads/events/1772258937302-DSC90851.jpg' }
                    ] : [];
                    setFormData({
                        pageId: pageId,
                        title: { en: '', te: '', hi: '' },
                        content: { en: '', te: '', hi: '' },
                        subtitle: { en: 'Live Event', te: 'లైవ్ ఈవెంట్', hi: 'लाइव कार्यक्रम' },
                        btnText: { en: 'View Details', te: 'మరింత సమాచారం', hi: 'विवरण देखें' },
                        btnLink: '',
                        image: '',
                        isActive: false,
                        volunteers: 500,
                        events: 50,
                        serviceHours: 10000,
                        sections: defaultSections
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
                    adminFetch('/api/admin/content', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'settings', ...settingsData }),
                    }),
                    adminFetch('/api/admin/content', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'content', ...formData }),
                    })
                ]);
            } else {
                const body = selectedPage === 'settings'
                    ? { type: 'settings', ...settingsData }
                    : { type: 'content', ...formData };

                const res = await adminFetch('/api/admin/content', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (data.content) {
                    setFormData(data.content);
                }
            }

            // Revalidate the public unit page after saving
            await Promise.all([
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/unit' }),
                }),
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/' }),
                }),
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/volunteer' }),
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

    const handleClearLiveEvent = async () => {
        if (!confirm('Are you sure you want to clear/delete the Live Event? This will remove it from the home page.')) return;
        setSaving(true);
        try {
            const clearedEvent = {
                pageId: 'live_event',
                title: { en: '', te: '', hi: '' },
                content: { en: '', te: '', hi: '' },
                subtitle: { en: 'Live Event', te: 'లైవ్ ఈవెంట్', hi: 'लाइव कार्यक्रम' },
                btnText: { en: 'View Details', te: 'మరింత సమాచారం', hi: 'विवरण देखें' },
                btnLink: '',
                image: '',
                isActive: false,
                sections: []
            };

            await adminFetch('/api/admin/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'content', ...clearedEvent }),
            });

            setFormData(clearedEvent);

            // Revalidate pages
            await Promise.all([
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/' }),
                }),
            ]).catch(err => console.log('Revalidation error:', err));

            alert('Live Event spotlight successfully cleared/deleted.');
        } catch (error) {
            console.error('Error clearing live event', error);
            alert('Failed to clear live event');
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
                            {selectedPage === 'hero' && (
                                <div className={styles.formGrid}>
                                    {/* 1. Hero Team Photo Upload */}
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ background: 'rgba(255, 153, 51, 0.05)', border: '1px solid rgba(255, 153, 51, 0.25)', padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FF9933', marginBottom: '8px' }}>
                                            Hero Visual Showcase Photo
                                        </h3>
                                        <p style={{ color: 'var(--marvel-text-dim)', fontSize: '13px', marginBottom: '18px' }}>
                                            The prominent image displayed inside the floating visual card on the homepage hero section.
                                        </p>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'center' }}>
                                            <div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className={styles.input}
                                                    onChange={handleHeroImageUpload}
                                                    disabled={uploading}
                                                />
                                                {uploading && <p style={{ fontSize: '12px', color: '#FF9933', marginTop: '6px' }}>Compressing & optimizing image...</p>}
                                                <small style={{ display: 'block', color: '#888', marginTop: '8px', fontSize: '12px' }}>
                                                    Upload any group or action photo. Auto-compressed & optimized for high-speed loading.
                                                </small>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: '100%', maxWidth: '340px', height: '200px', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255, 153, 51, 0.4)', background: '#111', position: 'relative' }}>
                                                    <img
                                                        src={formData.image || '/uploads/nss-team-hero.jpg'}
                                                        alt="Hero Photo Preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <span style={{ fontSize: '11px', color: '#FF9933', fontWeight: 700, marginTop: '6px' }}>
                                                    {formData.image ? '✓ Custom Uploaded Photo Ready to Save' : 'Default Preset Active (/uploads/nss-team-hero.jpg)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Homepage Quick Stats (Volunteers, Events, Service Hrs) */}
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.25)', padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa', marginBottom: '8px' }}>
                                            Homepage Quick Stats Strip
                                        </h3>
                                        <p style={{ color: 'var(--marvel-text-dim)', fontSize: '13px', marginBottom: '20px' }}>
                                            The 3 verified counters displayed below the action buttons in the homepage hero.
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Volunteers Counter</label>
                                                <input
                                                    type="number"
                                                    className={styles.input}
                                                    value={formData.volunteers}
                                                    onChange={(e) => setFormData({ ...formData, volunteers: Number(e.target.value) })}
                                                    required
                                                />
                                                <small style={{ color: '#888', fontSize: '11px' }}>Displays as <strong>{formData.volunteers || 500}+ Volunteers</strong></small>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Events Counter</label>
                                                <input
                                                    type="number"
                                                    className={styles.input}
                                                    value={formData.events}
                                                    onChange={(e) => setFormData({ ...formData, events: Number(e.target.value) })}
                                                    required
                                                />
                                                <small style={{ color: '#888', fontSize: '11px' }}>Displays as <strong>{formData.events || 50}+ Events</strong></small>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Service Hrs Counter</label>
                                                <input
                                                    type="number"
                                                    className={styles.input}
                                                    value={formData.serviceHours}
                                                    onChange={(e) => setFormData({ ...formData, serviceHours: Number(e.target.value) })}
                                                    required
                                                />
                                                <small style={{ color: '#888', fontSize: '11px' }}>Displays as <strong>{formData.serviceHours || 10000}+ Service Hrs</strong></small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedPage === 'volunteer_gallery' && (
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ background: 'rgba(255, 153, 51, 0.05)', border: '1px solid rgba(255, 153, 51, 0.25)', padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF9933', marginBottom: '8px' }}>
                                            Volunteer Portal — Service in Motion (5 Photo Mosaic Slots)
                                        </h3>
                                        <p style={{ color: 'var(--marvel-text-dim)', fontSize: '13.5px', marginBottom: '8px', lineHeight: 1.6 }}>
                                            Configure the 5 featured photographic highlight slots on the <strong>Join Us / Volunteer Portal (/volunteer)</strong>.
                                            You can choose any published event from the dropdown to automatically populate its cover picture, title, and category, or customize the title and image manually.
                                        </p>
                                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                                            Slot 1 is the large flagship highlight card (left). Slots 2 through 5 are the 4 supporting mosaic grid items (right).
                                        </span>
                                    </div>

                                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                                        const slot = (formData.sections && formData.sections[slotIdx]) || {
                                            eventId: '',
                                            title: { en: '' },
                                            subtitle: { en: '' },
                                            image: ''
                                        };
                                        const isLargeSlot = slotIdx === 0;

                                        return (
                                            <div
                                                key={slotIdx}
                                                className={`${styles.formGroup} ${styles.fullWidth}`}
                                                style={{
                                                    background: isLargeSlot ? 'rgba(255, 153, 51, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                                                    border: isLargeSlot ? '1px solid rgba(255, 153, 51, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                    padding: '20px',
                                                    borderRadius: '16px',
                                                    marginBottom: '20px'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: isLargeSlot ? '#FF9933' : '#fff' }}>
                                                        {isLargeSlot ? '⭐ Slot 1: Primary Large Showcase (Left)' : `Slot ${slotIdx + 1}: Supporting Showcase`}
                                                    </h4>
                                                    {slot.eventId && (
                                                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                                                            ✓ Linked to Event
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
                                                    <div>
                                                        {/* Event Selector Dropdown */}
                                                        <div className={styles.formGroup}>
                                                            <label className={styles.label}>Select Event to Display Here</label>
                                                            <select
                                                                className={styles.select}
                                                                value={slot.eventId || ''}
                                                                onChange={(e) => handleSelectEventForSlot(slotIdx, e.target.value)}
                                                            >
                                                                <option value="">-- Choose an Event from Database --</option>
                                                                {eventsList.map((ev) => {
                                                                    const title = typeof ev.title === 'object' ? (ev.title?.en || '') : ev.title;
                                                                    const yr = ev.academicYear ? ` [${ev.academicYear}]` : '';
                                                                    return (
                                                                        <option key={ev.id || ev._id} value={ev.id || ev._id}>
                                                                            {title}{yr}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                            <small style={{ color: '#aaa', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                                                Selecting an event will auto-fill its cover image, title, and category/year.
                                                            </small>
                                                        </div>

                                                        {/* Slot Caption / Title */}
                                                        <div className={styles.formGroup}>
                                                            <label className={styles.label}>Slot Display Title (Heading)</label>
                                                            <input
                                                                type="text"
                                                                className={styles.input}
                                                                value={slot.title?.en || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...(formData.sections || [])];
                                                                    while (updated.length < 5) updated.push({ eventId: '', title: { en: '' }, subtitle: { en: '' }, image: '' });
                                                                    updated[slotIdx] = { ...updated[slotIdx], title: { ...updated[slotIdx].title, en: e.target.value } };
                                                                    setFormData(prev => ({ ...prev, sections: updated }));
                                                                }}
                                                                placeholder="e.g. Mega Blood Donation Drives"
                                                            />
                                                        </div>

                                                        {/* Slot Subtitle / Impact tag */}
                                                        <div className={styles.formGroup}>
                                                            <label className={styles.label}>Slot Subtitle / Impact Note</label>
                                                            <input
                                                                type="text"
                                                                className={styles.input}
                                                                value={slot.subtitle?.en || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...(formData.sections || [])];
                                                                    while (updated.length < 5) updated.push({ eventId: '', title: { en: '' }, subtitle: { en: '' }, image: '' });
                                                                    updated[slotIdx] = { ...updated[slotIdx], subtitle: { ...updated[slotIdx].subtitle, en: e.target.value } };
                                                                    setFormData(prev => ({ ...prev, sections: updated }));
                                                                }}
                                                                placeholder="e.g. 300+ units collected for Red Cross"
                                                            />
                                                        </div>

                                                        {/* Or Upload Custom Image */}
                                                        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                            <label className={styles.label}>Or Upload Custom Photo for Slot {slotIdx + 1}</label>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className={styles.input}
                                                                onChange={(e) => handleSlotImageUpload(slotIdx, e)}
                                                                disabled={uploading}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Preview */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '100%',
                                                            height: isLargeSlot ? '240px' : '170px',
                                                            borderRadius: '14px',
                                                            overflow: 'hidden',
                                                            background: '#18181b',
                                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                                            position: 'relative'
                                                        }}>
                                                            {slot.image ? (
                                                                <img
                                                                    src={slot.image}
                                                                    alt={`Slot ${slotIdx + 1} Preview`}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px' }}>
                                                                    No Image Selected
                                                                </div>
                                                            )}
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                left: 0,
                                                                right: 0,
                                                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                                                                padding: '12px 14px',
                                                                color: '#fff'
                                                            }}>
                                                                <div style={{ fontSize: '13px', fontWeight: 800 }}>{slot.title?.en || `Slot ${slotIdx + 1}`}</div>
                                                                <div style={{ fontSize: '11px', color: '#d1d5db' }}>{slot.subtitle?.en || 'Impact note'}</div>
                                                            </div>
                                                        </div>
                                                        <span style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>
                                                            {slot.image ? '✓ Active Image Loaded' : 'Select an event above or upload a photo'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedPage === 'live_event' && (
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.05)', padding: '16px 20px', borderRadius: '18px', marginBottom: '24px' }}>
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            checked={formData.isActive || false}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <label htmlFor="isActive" style={{ margin: 0, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                                            Enable Featured Spotlight Section on Homepage
                                        </label>
                                    </div>

                                    {/* 1. Subtitle / Top Badge */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Top Badge / Category (English)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.subtitle?.en || ''}
                                            onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('subtitle', e.target.value)}
                                            placeholder="e.g. LIVE EVENT or ANNOUNCEMENT"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Top Badge / Category (Telugu)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.subtitle?.te || ''}
                                            onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Top Badge / Category (Hindi)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.subtitle?.hi || ''}
                                            onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, hi: e.target.value } })}
                                        />
                                    </div>

                                    {/* 2. Main Title */}
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Spotlight Title (English)</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    required
                                                    value={formData.title?.en || ''}
                                                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                                                    onBlur={(e) => handleAutoTranslate('title', e.target.value)}
                                                    placeholder="e.g. Build Week presents EPISODE 4"
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Spotlight Title (Telugu)</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    required
                                                    value={formData.title?.te || ''}
                                                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, te: e.target.value } })}
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Spotlight Title (Hindi)</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    required
                                                    value={formData.title?.hi || ''}
                                                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, hi: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Description / Content */}
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Spotlight Description (English)</label>
                                        <textarea
                                            className={styles.textarea}
                                            required
                                            value={formData.content?.en || ''}
                                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('content', e.target.value)}
                                            placeholder="Write an eye-catching and engaging description for this active spotlight/live event..."
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Spotlight Description (Telugu)</label>
                                                <textarea
                                                    className={styles.textarea}
                                                    required
                                                    value={formData.content?.te || ''}
                                                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, te: e.target.value } })}
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Spotlight Description (Hindi)</label>
                                                <textarea
                                                    className={styles.textarea}
                                                    required
                                                    value={formData.content?.hi || ''}
                                                    onChange={(e) => setFormData({ ...formData, content: { ...formData.content, hi: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Portrait Image Upload */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                            Portrait Spotlight Photo *
                                        </label>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.15)', padding: '20px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className={styles.input}
                                                style={{ border: 'none', background: 'transparent', padding: 0 }}
                                                onChange={handleLiveEventImageUpload}
                                                disabled={uploading}
                                            />
                                            <small style={{ color: '#aaa', fontSize: '12px' }}>
                                                Notice: You can upload exactly **one** portrait-oriented photo (height must be greater than width). Landscape files will be rejected.
                                            </small>
                                            {uploading && <div style={{ fontSize: '12px', color: 'var(--color-primary)' }}>Validating & compressing portrait image...</div>}
                                        </div>
                                    </div>

                                    {/* Image Preview Panel */}
                                    <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {formData.image ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '160px', height: '240px', borderRadius: '16px', overflow: 'hidden', border: '3px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', background: '#222' }}>
                                                    <img src={formData.image} alt="Portrait Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981', fontWeight: 'bold' }}>✓ Valid Portrait Selected</span>
                                            </div>
                                        ) : (
                                            <div style={{ width: '160px', height: '240px', borderRadius: '16px', border: '2px dashed rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
                                                No portrait image uploaded yet.
                                            </div>
                                        )}
                                    </div>

                                    {/* 5. Button Text & Action Links */}
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Button Text (English)</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    required
                                                    value={formData.btnText?.en || ''}
                                                    onChange={(e) => setFormData({ ...formData, btnText: { ...formData.btnText, en: e.target.value } })}
                                                    onBlur={(e) => handleAutoTranslate('btnText', e.target.value)}
                                                    placeholder="e.g. View Details"
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Button Text (Telugu)</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    required
                                                    value={formData.btnText?.te || ''}
                                                    onChange={(e) => setFormData({ ...formData, btnText: { ...formData.btnText, te: e.target.value } })}
                                                />
                                            </div>
                                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                <label className={styles.label}>Button Text (Hindi)</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    required
                                                    value={formData.btnText?.hi || ''}
                                                    onChange={(e) => setFormData({ ...formData, btnText: { ...formData.btnText, hi: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Action Button Link / URL</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.btnLink || ''}
                                            onChange={(e) => setFormData({ ...formData, btnLink: e.target.value })}
                                            placeholder="e.g. /announcements, or an external registration form URL"
                                        />
                                        <small style={{ color: '#aaa' }}>
                                            Link to a specific page or announcement (e.g. `/announcements` to direct users directly to announcements).
                                        </small>
                                    </div>
                                </div>
                            )}

                            {selectedPage !== 'unit' && selectedPage !== 'live_event' && selectedPage !== 'hero' && selectedPage !== 'volunteer_gallery' && (
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

                            {selectedPage !== 'unit' && selectedPage !== 'live_event' && (
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
                                                        value={section.heading?.en || ''}
                                                        onChange={(e) => updateSection(index, 'heading', 'en', e.target.value)}
                                                        onBlur={(e) => handleAutoTranslate('heading', e.target.value, index)}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Heading (TE)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        value={section.heading?.te || ''}
                                                        onChange={(e) => updateSection(index, 'heading', 'te', e.target.value)}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Heading (HI)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        value={section.heading?.hi || ''}
                                                        onChange={(e) => updateSection(index, 'heading', 'hi', e.target.value)}
                                                    />
                                                </div>
                                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                    <label className={styles.label}>Content (EN)</label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={section.content?.en || ''}
                                                        onChange={(e) => updateSection(index, 'content', 'en', e.target.value)}
                                                        onBlur={(e) => handleAutoTranslate('content', e.target.value, index)}
                                                    />
                                                </div>
                                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                    <label className={styles.label}>Content (TE)</label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={section.content?.te || ''}
                                                        onChange={(e) => updateSection(index, 'content', 'te', e.target.value)}
                                                    />
                                                </div>
                                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                    <label className={styles.label}>Content (HI)</label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={section.content?.hi || ''}
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

                    <div style={{ display: 'flex', justifySelf: 'end', marginTop: '1rem', gap: '12px' }}>
                        {selectedPage === 'live_event' && formData.image && (
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnDanger}`}
                                onClick={handleClearLiveEvent}
                                disabled={saving}
                            >
                                Clear/Delete Live Event
                            </button>
                        )}
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

