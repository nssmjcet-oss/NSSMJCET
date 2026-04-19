'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatters';
import styles from '../events/events.module.css'; // Steal events styling for consistency
import { translateText } from '@/utils/translation';
import { Edit2, Trash2, Plus, Globe } from 'lucide-react';

const translations = {
    en: {
        title: 'External Portals',
        createEvent: 'Add New Portal',
        loading: 'Loading portals...',
        noEvents: 'No portals found. Click above to add one!',
        edit: 'Edit',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this portal?',
        url: 'Website URL',
    },
    te: {
        title: 'బాహ్య పోర్టల్స్',
        createEvent: 'కొత్త పోర్టల్ జోడించండి',
        loading: 'పోర్టల్స్ లోడ్ చేస్తున్నాము...',
        noEvents: 'పోర్టల్స్ కనుగొనబడలేదు. ఒక్కటి జోడించడానికి పైన క్లిక్ చేయండి!',
        edit: 'సవరించు',
        delete: 'తొలగించు',
        confirmDelete: 'మీరు ఖచ్చితంగా దీన్ని తొలగించాలనుకుంటున్నారా?',
        url: 'వెబ్‌సైట్ URL',
    },
    hi: {
        title: 'बाहरी पोर्टल',
        createEvent: 'नया पोर्टल जोड़ें',
        loading: 'पोर्टल लोड हो रहे हैं...',
        noEvents: 'कोई पोर्टल नहीं मिला। एक जोड़ने के लिए ऊपर क्लिक करें!',
        edit: 'संपादित करें',
        delete: 'हटाएं',
        confirmDelete: 'क्या आप वाकई इसे हटाना चाहते हैं?',
        url: 'वेबसाइट यूआरएल',
    },
};

export default function PortalsPage() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language];

    const [portals, setPortals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPortal, setEditingPortal] = useState(null);

    useEffect(() => {
        fetchPortals();
    }, []);

    const fetchPortals = async () => {
        try {
            const response = await fetch('/api/admin/portals');
            const data = await response.json();
            if (response.ok) {
                setPortals(data.portals);
            }
        } catch (error) {
            console.error('Failed to fetch portals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t.confirmDelete)) return;

        try {
            const response = await fetch(`/api/admin/portals?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchPortals();
                fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: '/' }),
                }).catch(err => console.log(err));
            } else {
                alert('Failed to delete portal');
            }
        } catch (error) {
            console.error('Failed to delete portal:', error);
            alert('Failed to delete portal');
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

            {portals.length === 0 ? (
                <div className={styles.noData}>
                    <p>{t.noEvents}</p>
                </div>
            ) : (
                <div className={styles.eventsGrid}>
                    {portals.map((portal) => (
                        <div key={portal.id} className={styles.eventCard}>
                            <div className={styles.eventHeader}>
                                <h3 className={styles.cardTitle}>{portal.title[language] || portal.title.en}</h3>
                            </div>

                            <p className={styles.eventDescription}>
                                {(portal.description?.[language] || portal.description?.en || '').substring(0, 150)}
                            </p>

                            <div className={styles.eventMeta}>
                                <div className={styles.metaItem}>
                                    <Globe className={styles.metaIcon} size={16} />
                                    <a href={portal.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                                        {portal.url.replace(/^https?:\/\//, '').substring(0, 30)}...
                                    </a>
                                </div>
                            </div>

                            <div className={styles.eventActions}>
                                <button
                                    className={styles.eventEditBtn}
                                    onClick={() => setEditingPortal(portal)}
                                >
                                    <Edit2 size={16} /> {t.edit}
                                </button>
                                <button
                                    className={styles.eventDeleteBtn}
                                    onClick={() => handleDelete(portal.id)}
                                >
                                    <Trash2 size={16} /> {t.delete}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <PortalFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchPortals();
                        fetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/' }),
                        }).catch(err => console.log('Revalidation error:', err));
                    }}
                />
            )}

            {editingPortal && (
                <PortalFormModal
                    portal={editingPortal}
                    onClose={() => setEditingPortal(null)}
                    onSuccess={() => {
                        setEditingPortal(null);
                        fetchPortals();
                        fetch('/api/revalidate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: '/' }),
                        }).catch(err => console.log('Revalidation error:', err));
                    }}
                />
            )}
        </div>
    );
}

// Portal Form Modal
function PortalFormModal({ portal, onClose, onSuccess }) {
    const isEdit = !!portal;
    const [activeTab, setActiveTab] = useState('en');
    const [formData, setFormData] = useState({
        title: {
            en: portal?.title?.en || '',
            te: portal?.title?.te || '',
            hi: portal?.title?.hi || '',
        },
        description: {
            en: portal?.description?.en || '',
            te: portal?.description?.te || '',
            hi: portal?.description?.hi || '',
        },
        url: portal?.url || '',
    });

    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let targetUrl = formData.url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl; // Force valid URI
        }

        setLoading(true);
        setError('');

        try {
            const url = '/api/admin/portals';
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit
                ? { id: portal.id, ...formData, url: targetUrl }
                : { ...formData, url: targetUrl };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(data.error || 'Failed to save portal');
            }
        } catch (err) {
            setError('Failed to save portal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEdit ? 'Edit Portal' : 'Add New Portal'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {translating && <div className="alert alert-info" style={{ margin: '10px 20px 0', padding: '8px 12px', fontSize: '12px' }}>Auto-translating to Hindi & Telugu...</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.modalBody}>
                        
                        <div className="form-group">
                            <label className="label">Exact Website URL * (e.g. hackathon.com)</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.tabs} style={{ marginTop: '20px'}}>
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

                        {['en', 'te', 'hi'].map((lang) => (
                            activeTab === lang && (
                                <div key={lang}>
                                    <div className="form-group">
                                        <label className="label">Button Label / Title ({lang.toUpperCase()}) *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.title[lang]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                title: { ...formData.title, [lang]: e.target.value }
                                            })}
                                            onBlur={lang === 'en' ? (e) => handleAutoTranslate('title', e.target.value) : undefined}
                                            required
                                            placeholder="e.g. Register for Hackathon"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Hover Subject Description (Optional)</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.description[lang]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                description: { ...formData.description, [lang]: e.target.value }
                                            })}
                                            onBlur={lang === 'en' ? (e) => handleAutoTranslate('description', e.target.value) : undefined}
                                            placeholder="A short snippet to show if desired"
                                        />
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update Portal' : 'Save Portal')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
