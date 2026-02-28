'use client';
// Re-triggering chunk generation for events management
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatters';
import styles from './events.module.css';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage, compressImageToDataURL } from '@/utils/image-compression';
import { translateText } from '@/utils/translation';
import { Calendar, MapPin, Edit2, Trash2, Plus, Clock, Globe } from 'lucide-react';

const translations = {
    en: {
        title: 'Events Management',
        createEvent: 'Create New Event',
        allEvents: 'All Events',
        published: 'Published',
        draft: 'Draft',
        loading: 'Loading events...',
        noEvents: 'No events found',
        edit: 'Edit',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this event?',
        date: 'Date',
        location: 'Location',
        status: 'Status',
        actions: 'Actions',
        upcoming: 'Upcoming',
        past: 'Past',
    },
    te: {
        title: 'ఈవెంట్స్ నిర్వహణ',
        createEvent: 'కొత్త ఈవెంట్ సృష్టించండి',
        allEvents: 'అన్ని ఈవెంట్స్',
        published: 'ప్రచురించబడింది',
        draft: 'డ్రాఫ్ట్',
        loading: 'ఈవెంట్స్ లోడ్ చేస్తోంది...',
        noEvents: 'ఈవెంట్స్ కనుగొనబడలేదు',
        edit: 'సవరించు',
        delete: 'తొలగించు',
        confirmDelete: 'మీరు ఖచ్చితంగా ఈ ఈవెంట్‌ను తొలగించాలనుకుంటున్నారా?',
        date: 'తేదీ',
        location: 'స్థలం',
        status: 'స్థితి',
        actions: 'చర్యలు',
        upcoming: 'రాబోయేవి',
        past: 'గతించినవి',
    },
    hi: {
        title: 'कार्यक्रम प्रबंधन',
        createEvent: 'नया कार्यक्रम बनाएं',
        allEvents: 'सभी कार्यक्रम',
        published: 'प्रकाशित',
        draft: 'ड्राफ्ट',
        loading: 'कार्यक्रम लोड हो रहे हैं...',
        noEvents: 'कोई कार्यक्रम नहीं मिला',
        edit: 'संपादित करें',
        delete: 'हटाएं',
        confirmDelete: 'क्या आप वाकई इस कार्यक्रम को हटाना चाहते हैं?',
        date: 'तारीख',
        location: 'स्थान',
        status: 'स्थिति',
        actions: 'कार्रवाइयां',
        upcoming: 'आगामी',
        past: 'बीते हुए',
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

    const fetchEvents = async () => {
        try {
            const url = filter === 'all'
                ? '/api/admin/events'
                : `/api/admin/events?status=${filter}`;

            const response = await fetch(url);
            const data = await response.json();
            if (response.ok) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t.confirmDelete)) return;

        try {
            const response = await fetch(`/api/admin/events?id=${id}`, {
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
        <div className={styles.eventsPage}>
            <div className={styles.header}>
                <h2>{t.title}</h2>
                <button
                    className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} /> {t.createEvent}
                </button>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
                    onClick={() => setFilter('all')}
                >
                    {t.allEvents}
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'published' ? styles.filterBtnActive : ''}`}
                    onClick={() => setFilter('published')}
                >
                    {t.published}
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'draft' ? styles.filterBtnActive : ''}`}
                    onClick={() => setFilter('draft')}
                >
                    {t.draft}
                </button>
            </div>

            {events.length === 0 ? (
                <div className={styles.noData}>
                    <p>{t.noEvents}</p>
                </div>
            ) : (
                <div className={styles.eventsGrid}>
                    {events.map((event) => (
                        <div key={event.id} className={styles.eventCard}>
                            <div className={styles.eventHeader}>
                                <div className={styles.badgeRow}>
                                    <span className={`${styles.badge} ${event.status === 'published' ? styles.badgeSuccess : styles.badgeWarning}`}>
                                        {event.status === 'published' ? t.published : t.draft}
                                    </span>
                                    <span className={`${styles.badge} ${event.eventType === 'past' ? styles.badgeDanger : styles.badgeInfo}`}>
                                        {event.eventType === 'past' ? t.past : t.upcoming}
                                    </span>
                                </div>
                                <h3 className={styles.cardTitle}>{event.title[language] || event.title.en}</h3>
                            </div>

                            <p className={styles.eventDescription}>
                                {(event.description[language] || event.description.en).substring(0, 150)}...
                            </p>

                            <div className={styles.eventMeta}>
                                <div className={styles.metaItem}>
                                    <Calendar className={styles.metaIcon} size={16} />
                                    <span>{formatDate(event.date)}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <MapPin className={styles.metaIcon} size={16} />
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <div className={styles.eventActions}>
                                <button
                                    className={styles.eventEditBtn}
                                    onClick={() => setEditingEvent(event)}
                                >
                                    <Edit2 size={16} /> {t.edit}
                                </button>
                                <button
                                    className={styles.eventDeleteBtn}
                                    onClick={() => handleDelete(event.id)}
                                >
                                    <Trash2 size={16} /> {t.delete}
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
                        fetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/' }),
                        }).catch(err => console.log('Revalidation error:', err));
                        fetch('/api/revalidate', {
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
                        fetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/' }),
                        }).catch(err => console.log('Revalidation error:', err));
                        fetch('/api/revalidate', {
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
        location: event?.location || '',
        images: event?.images || [],
        status: event?.status || 'draft',
        eventType: event?.eventType || 'upcoming',
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [error, setError] = useState('');

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
                // Use smaller dimensions and lower quality to fit Firestore 1MB document limit
                const dataUrl = await compressImageToDataURL(file, {
                    maxWidth: 800,
                    maxHeight: 800,
                    quality: 0.6
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

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                // Revalidate the public events page (non-blocking)
                fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/events' }),
                }).catch(err => console.log('Revalidation error:', err));

                // Also revalidate home page
                fetch('/api/revalidate', {
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
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEdit ? 'Edit Event' : 'Create New Event'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {translating && <div className="alert alert-info" style={{ margin: '10px 20px 0', padding: '8px 12px', fontSize: '12px' }}>Auto-translating to Hindi & Telugu...</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.modalBody}>
                        <div className={styles.tabs}>
                            <button
                                type="button"
                                className={`${styles.tab} ${activeTab === 'en' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('en')}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                className={`${styles.tab} ${activeTab === 'te' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('te')}
                            >
                                తెలుగు (Telugu)
                            </button>
                            <button
                                type="button"
                                className={`${styles.tab} ${activeTab === 'hi' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('hi')}
                            >
                                हिंदी (Hindi)
                            </button>
                        </div>

                        {activeTab === 'en' && (
                            <>
                                <div className="form-group">
                                    <label className="label">Title (English) *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.title.en}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            title: { ...formData.title, en: e.target.value }
                                        })}
                                        onBlur={(e) => handleAutoTranslate('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Description (English) *</label>
                                    <textarea
                                        className="input textarea"
                                        value={formData.description.en}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            description: { ...formData.description, en: e.target.value }
                                        })}
                                        onBlur={(e) => handleAutoTranslate('description', e.target.value)}
                                        required
                                        rows="5"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'te' && (
                            <>
                                <div className="form-group">
                                    <label className="label">Title (Telugu) *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.title.te}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            title: { ...formData.title, te: e.target.value }
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Description (Telugu) *</label>
                                    <textarea
                                        className="input textarea"
                                        value={formData.description.te}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            description: { ...formData.description, te: e.target.value }
                                        })}
                                        required
                                        rows="5"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'hi' && (
                            <>
                                <div className="form-group">
                                    <label className="label">Title (Hindi) *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.title.hi}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            title: { ...formData.title, hi: e.target.value }
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Description (Hindi) *</label>
                                    <textarea
                                        className="input textarea"
                                        value={formData.description.hi}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            description: { ...formData.description, hi: e.target.value }
                                        })}
                                        required
                                        rows="5"
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="label">Date *</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Location *</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Images * (First image will be the cover)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="input"
                                onChange={handleImageUpload}
                            />
                            {uploading && <p style={{ marginTop: '6px', fontSize: '13px', color: '#666' }}>Processing images...</p>}
                            <div className={styles.imagePreviewGrid}>
                                {formData.images.map((img, index) => (
                                    <div key={index} className={styles.imagePreviewItem}>
                                        <img src={img} alt={`Preview ${index}`} />
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={() => removeImage(index)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Event Type *</label>
                            <select
                                className="input"
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">Status *</label>
                            <select
                                className="input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                            {loading ? 'Saving...' : uploading ? 'Processing...' : (isEdit ? 'Update Event' : 'Create Event')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
