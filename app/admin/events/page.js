'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '../admin-content.module.css';
import { Icons } from '@/components/Icons';
import { adminFetch } from '@/utils/api-client';
import { Plus, Calendar, MapPin, Edit2, Trash2, Crop } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL } from '@/utils/image-compression';
import ImageCropperModal from '@/components/ImageCropperModal';

const translations = {
    en: {
        title: 'Events Management',
        createEvent: 'Create New Event',
        allEvents: 'All Events',
        published: 'Published',
        draft: 'Draft',
        loading: 'Loading events...',
        confirmDelete: 'Are you sure you want to delete this event?',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        status: 'Status',
        title: 'Title',
        date: 'Date',
        category: 'Category',
    },
    te: {
        title: 'ఈవెంట్స్ నిర్వహణ',
        createEvent: 'కొత్త ఈవెంట్‌ను సృష్టించండి',
        allEvents: 'అన్ని ఈవెంట్‌లు',
        published: 'ప్రచురించబడింది',
        draft: 'డ్రాఫ్ట్',
        loading: 'ఈవెంట్‌లను లోడ్ చేస్తోంది...',
        confirmDelete: 'మీరు ఖచ్చితంగా ఈ ఈవెంట్‌ను తొలగించాలనుకుంటున్నారా?',
        actions: 'చర్యలు',
        edit: 'సవరించు',
        delete: 'తొలగించు',
        status: 'స్థితి',
        title: 'శీర్షిక',
        date: 'తేదీ',
        category: 'వర్గం',
    },
    hi: {
        title: 'ईवेंट प्रबंधन',
        createEvent: 'नया ईवेंट बनाएं',
        allEvents: 'सभी ईवेंट',
        published: 'प्रकाशित',
        draft: 'ड्राफ्ट',
        loading: 'ईवेंट लोड हो रहे हैं...',
        confirmDelete: 'क्या आप वाकई इस ईवेंट को हटाना चाहते हैं?',
        actions: 'कार्रवाइयां',
        edit: 'संपादित करें',
        delete: 'हटाएं',
        status: 'स्थिति',
        title: 'शीर्षक',
        date: 'तारीఖ',
        category: 'श्रेणी',
    },
};

export default function EventsPage() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language];

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchEvents();
    }, [filter]);

    const fetchEvents = useCallback(async () => {
        try {
            const url = filter === 'all'
                ? '/api/admin/events'
                : `/api/admin/events?status=${filter}`;

            const response = await adminFetch(url);
            const data = await response.json();
            if (response.ok) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const handleDelete = async (id) => {
        if (!confirm(t.confirmDelete)) return;

        try {
            const response = await adminFetch(`/api/admin/events?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchEvents();
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event');
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
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>{t.title}</h2>
                    <p className={styles.sectionSubtitle}>Create and manage organization events</p>
                </div>
                <button
                    className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} /> {t.createEvent}
                </button>
            </div>

            <div className={styles.card} style={{ padding: '12px', borderRadius: '20px', marginBottom: '32px', display: 'inline-flex', gap: '8px' }}>
                <button
                    className={`${styles.btn} ${filter === 'all' ? styles.btnPrimary : styles.btnSecondary}`}
                    onClick={() => setFilter('all')}
                    style={{ borderRadius: '14px' }}
                >
                    {t.allEvents}
                </button>
                <button
                    className={`${styles.btn} ${filter === 'published' ? styles.btnPrimary : styles.btnSecondary}`}
                    onClick={() => setFilter('published')}
                    style={{ borderRadius: '14px' }}
                >
                    {t.published}
                </button>
                <button
                    className={`${styles.btn} ${filter === 'draft' ? styles.btnPrimary : styles.btnSecondary}`}
                    onClick={() => setFilter('draft')}
                    style={{ borderRadius: '14px' }}
                >
                    {t.draft}
                </button>
            </div>

            {events.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <Calendar size={48} style={{ color: 'var(--marvel-text-dim)', marginBottom: '20px', opacity: 0.5 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{t.noEvents}</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {events.map((event) => (
                        <div key={event.id} className={styles.gridItem}>
                            {event.images && event.images[0] && (
                                <img src={event.images[0]} alt="" className={styles.gridImage} />
                            )}
                            <div className={styles.gridContent}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                    <span className={`${styles.badge} ${event.status === 'published' ? styles.badgeSuccess : styles.badgeWarning}`}>
                                        {event.status === 'published' ? t.published : t.draft}
                                    </span>
                                    <span className={`${styles.badge} ${
                                        event.eventType === 'ongoing' ? styles.badgeWarning :
                                        (event.eventType === 'completed' || event.eventType === 'past') ? styles.badgeError :
                                        event.eventType === 'archived' ? styles.badgeSecondary :
                                        styles.badgeInfo
                                    }`}>
                                        {(event.eventType || 'upcoming').toUpperCase()}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '12px', lineHeight: '1.3' }}>
                                    {event.title[language] || event.title.en}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--marvel-text-dim)', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={14} style={{ color: '#3b82f6' }} />
                                        <span>
                                            {event.endDate && event.endDate !== event.date
                                                ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                                                : formatDate(event.date)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={14} style={{ color: '#3b82f6' }} />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.gridActions}>
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => setEditingEvent(event)}
                                >
                                    <Edit2 size={14} /> {t.edit}
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnDanger}`}
                                    onClick={() => handleDelete(event.id)}
                                >
                                    <Trash2 size={14} /> {t.delete}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <EventFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchEvents();
                        // Revalidate home page and events page
                        adminFetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/' }),
                        }).catch(err => console.log('Revalidation error:', err));
                        adminFetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/events' }),
                        }).catch(err => console.log('Revalidation error:', err));
                    }}
                />
            )}

            {editingEvent && (
                <EventFormModal
                    event={editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onSuccess={() => {
                        setEditingEvent(null);
                        fetchEvents();
                        // Revalidate home page and events page
                        adminFetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/' }),
                        }).catch(err => console.log('Revalidation error:', err));
                        adminFetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/events' }),
                        }).catch(err => console.log('Revalidation error:', err));
                    }}
                />
            )}
        </div>
    );
}

// Event Form Modal
function EventFormModal({ event, onClose, onSuccess }) {
    const isEdit = !!event;
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('en');
    const [formData, setFormData] = useState({
        title: {
            en: event?.title?.en || '',
            te: event?.title?.te || '',
            hi: event?.title?.hi || '',
        },
        description: {
            en: event?.description?.en || '',
            te: event?.description?.te || '',
            hi: event?.description?.hi || '',
        },
        date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
        endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        location: event?.location || '',
        images: event?.images || [],
        status: event?.status || 'published',
        eventType: event?.eventType || 'upcoming',
        academicYear: event?.academicYear || '2026-2027',
        highlights: event?.highlights || '',
        winners: event?.winners || '',
        report: event?.report || '',
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [error, setError] = useState('');

    const [cropper, setCropper] = useState({
        isOpen: false,
        imageSrc: '',
        targetIndex: null,
        aspectRatio: 16 / 9,
        title: 'Crop Event Banner (16:9 Landscape)'
    });

    const handleSingleImageSelectAndCrop = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setCropper({
                isOpen: true,
                imageSrc: reader.result,
                targetIndex: null,
                aspectRatio: formData.images.length === 0 ? 16 / 9 : 0,
                title: formData.images.length === 0 ? 'Crop Event Cover Banner (16:9)' : 'Crop Image'
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = (croppedDataUrl) => {
        if (cropper.targetIndex !== null && cropper.targetIndex !== undefined) {
            setFormData(prev => {
                const next = [...prev.images];
                next[cropper.targetIndex] = croppedDataUrl;
                return { ...prev, images: next };
            });
        } else {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, croppedDataUrl]
            }));
        }
    };

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
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError(''); // Clear previous errors when starting new upload
        try {
            const uploadPromises = files.map(async (file) => {
                // MongoDB friendly compression: HD resolution but optimized quality (0.75) and size to prevent request payload limits
                const dataUrl = await compressImageToDataURL(file, {
                    maxWidth: 1200,
                    maxHeight: 1200,
                    quality: 0.75
                });
                return dataUrl;
            });
            const uploadedUrls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));

            // Clear the input value so the same files can be selected again if needed
            e.target.value = '';
        } catch (err) {
            console.error('Image upload failed:', err);
            let errorMessage = 'Unknown error';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (err instanceof Event) {
                errorMessage = 'Browser error during file reading/processing. This often happens with unsupported formats like HEIC.';
            } else if (typeof err === 'object' && err !== null) {
                errorMessage = JSON.stringify(err);
            } else {
                errorMessage = String(err);
            }

            // Check for HEIC specifically to give a hint
            const hasHeic = files.some(f => f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif'));
            if (hasHeic) {
                errorMessage += ' (HEIC/HEIF conversion was attempted but encountered a browser-level failure. Please try converting to JPEG manually if the issue persists.)';
            }

            setError('Failed to upload images: ' + errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.images.length === 0) {
            setError('At least one image (Cover Image) is required. Please wait for images to finish processing.');
            setLoading(false);
            return;
        }

        try {
            const url = '/api/admin/events';
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit
                ? { id: event.id, ...formData }
                : { ...formData, createdBy: user?.uid || 'admin' };

            const response = await adminFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                // Revalidate the public events page (non-blocking)
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/events' }),
                }).catch(err => console.log('Revalidation error:', err));

                // Also revalidate home page
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/' }),
                }).catch(err => console.log('Revalidation error:', err));

                onSuccess();
            } else {
                setError(data.error || 'Failed to save event');
            }
        } catch (err) {
            setError('Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{isEdit ? 'Edit Event' : 'Create New Event'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div className={styles.badge} style={{ width: 'calc(100% - 40px)', margin: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px', justifyContent: 'center' }}>{error}</div>}
                {translating && <div className={styles.badge} style={{ width: 'calc(100% - 40px)', margin: '10px 20px 0', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '10px', justifyContent: 'center' }}>Auto-translating to Hindi & Telugu...</div>}

                <form onSubmit={handleSubmit} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.modalBody}>
                        <div className={styles.tabs} style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '16px' }}>
                            {['en', 'te', 'hi'].map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    className={`${styles.btn} ${activeTab === lang ? styles.btnPrimary : styles.btnSecondary}`}
                                    onClick={() => setActiveTab(lang)}
                                    style={{ flex: 1, borderRadius: '12px', padding: '10px' }}
                                >
                                    {lang === 'en' ? 'English' : lang === 'te' ? 'తెలుగు' : 'हिंदी'}
                                </button>
                            ))}
                        </div>

                        {['en', 'te', 'hi'].map((lang) => (
                            activeTab === lang && (
                                <div key={lang} style={{ animation: 'fadeIn 0.4s ease' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Title ({lang.toUpperCase()}) *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.title[lang]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                title: { ...formData.title, [lang]: e.target.value }
                                            })}
                                            onBlur={lang === 'en' ? (e) => handleAutoTranslate('title', e.target.value) : undefined}
                                            required
                                            placeholder={`Event title in ${lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : 'Hindi'}`}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Description ({lang.toUpperCase()}) *</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={formData.description[lang]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                description: { ...formData.description, [lang]: e.target.value }
                                            })}
                                            onBlur={lang === 'en' ? (e) => handleAutoTranslate('description', e.target.value) : undefined}
                                            required
                                            rows="5"
                                            placeholder="Provide a detailed event schedule and highlights..."
                                        />
                                    </div>
                                </div>
                            )
                        ))}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Start Date *</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>End Date (Optional)</label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Location Reference *</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                    placeholder="e.g. Main Auditorium"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Visual Assets * (First image is Cover Banner)</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,153,51,0.2)', color: '#FF9933', border: '1px solid rgba(255,153,51,0.3)', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                    <Crop size={14} />
                                    <span>Upload & Crop Image (16:9 Banner)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSingleImageSelectAndCrop}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>or bulk upload:</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className={styles.input}
                                    onChange={handleImageUpload}
                                    style={{ maxWidth: '240px' }}
                                />
                            </div>
                            {uploading && <p style={{ marginTop: '8px', fontSize: '12px', color: '#60a5fa', fontWeight: 'bold' }}>Optimizing assets for professional display...</p>}
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginTop: '14px' }}>
                                {formData.images.map((img, index) => (
                                    <div key={index} style={{ position: 'relative', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            title="Crop this image"
                                            style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(255, 153, 51, 0.95)', color: 'white', border: 'none', borderRadius: '6px', width: '22px', height: '22px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                                            onClick={() => setCropper({
                                                isOpen: true,
                                                imageSrc: img,
                                                targetIndex: index,
                                                aspectRatio: index === 0 ? 16 / 9 : 0,
                                                title: index === 0 ? 'Crop Event Cover Banner (16:9 Landscape)' : 'Crop Image'
                                            })}
                                        >
                                            <Crop size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            title="Remove image"
                                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.95)', color: 'white', border: 'none', borderRadius: '6px', width: '22px', height: '22px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                                            onClick={() => removeImage(index)}
                                        >
                                            &times;
                                        </button>
                                        {index === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(59, 130, 246, 0.9)', color: 'white', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', padding: '2px 0' }}>COVER (16:9)</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Academic Session Selection */}
                        <div style={{ display: 'grid', gridTemplateColumns: (!['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023', '2021-2022'].includes(formData.academicYear) || formData.academicYear === '') ? '1fr 1fr' : '1fr', gap: '24px', marginBottom: '24px' }}>
                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.label}>Academic Session *</label>
                                <select
                                    className={styles.select}
                                    value={['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023', '2021-2022'].includes(formData.academicYear) ? formData.academicYear : 'custom'}
                                    onChange={(e) => {
                                        if (e.target.value !== 'custom') {
                                            setFormData({ ...formData, academicYear: e.target.value });
                                        } else {
                                            setFormData({ ...formData, academicYear: '' });
                                        }
                                    }}
                                >
                                    <option value="2026-2027">2026-2027</option>
                                    <option value="2025-2026">2025-2026</option>
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2023-2024">2023-2024</option>
                                    <option value="2022-2023">2022-2023</option>
                                    <option value="2021-2022">2021-2022</option>
                                    <option value="custom">Other / Custom Year...</option>
                                </select>
                            </div>

                            {(!['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023', '2021-2022'].includes(formData.academicYear) || formData.academicYear === '') && (
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.label}>Enter Custom Year *</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={formData.academicYear || ''}
                                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                        placeholder="e.g. 2026-2027"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Event Lifecycle Status *</label>
                                <select
                                    className={styles.select}
                                    value={formData.eventType}
                                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                >
                                    <option value="upcoming">UPCOMING (Scheduled Event)</option>
                                    <option value="ongoing">ONGOING (Active Right Now)</option>
                                    <option value="completed">COMPLETED (Concluded Event)</option>
                                    <option value="archived">ARCHIVED (Past Record)</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Publishing Visibility *</label>
                                <select
                                    className={styles.select}
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="published">Visible to Public</option>
                                    <option value="draft">Internal Draft</option>
                                </select>
                            </div>
                        </div>

                        {/* Post-Event Section (Highlights, Winners, Report) */}
                        <div style={{
                            marginTop: '16px',
                            padding: '20px',
                            background: 'rgba(255, 153, 51, 0.05)',
                            border: '1px solid rgba(255, 153, 51, 0.2)',
                            borderRadius: '16px'
                        }}>
                            <h4 style={{ color: '#FF9933', fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>
                                Post-Event Outcomes & Highlights {formData.eventType === 'completed' ? '(Active)' : '(Optional)'}
                            </h4>
                            <p style={{ color: 'var(--marvel-text-dim)', fontSize: '12px', marginBottom: '16px' }}>
                                When the event is completed, enter highlights, winners, and reports here. The website will automatically format and display them for attendees and visitors.
                            </p>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Event Highlights & Outcomes</label>
                                <textarea
                                    className={styles.textarea}
                                    rows="3"
                                    value={formData.highlights}
                                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                    placeholder="e.g. Over 250 blood units collected. 15 medical staff volunteers engaged. Inaugurated by Principal."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Winners / Special Recognition</label>
                                <textarea
                                    className={styles.textarea}
                                    rows="3"
                                    value={formData.winners}
                                    onChange={(e) => setFormData({ ...formData, winners: e.target.value })}
                                    placeholder="e.g. 1st Place: Best Delegate - John Doe (CSE) | 2nd Place: High Commendation - Jane Smith (ECE)"
                                />
                            </div>

                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.label}>Official Summary / Report</label>
                                <textarea
                                    className={styles.textarea}
                                    rows="3"
                                    value={formData.report}
                                    onChange={(e) => setFormData({ ...formData, report: e.target.value })}
                                    placeholder="Full conclusion summary, remarks, and social impact achieved."
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading || uploading} style={{ minWidth: '160px' }}>
                            {loading ? 'Propagating...' : (isEdit ? 'Authorize Update' : 'Publish Event')}
                        </button>
                    </div>
                </form>
            </div>

            <ImageCropperModal
                isOpen={cropper.isOpen}
                imageSrc={cropper.imageSrc}
                aspectRatio={cropper.aspectRatio}
                title={cropper.title}
                onCropComplete={handleCropComplete}
                onClose={() => setCropper(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
