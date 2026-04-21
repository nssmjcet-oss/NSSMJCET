'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '../admin-content.module.css';
import { Icons } from '@/components/Icons';
import { adminFetch } from '@/utils/api-client';
import { Plus, Globe, Edit2, Trash2 } from 'lucide-react';
import { translateText } from '@/utils/translation';

const translations = {
    en: {
        title: 'Portals Management',
        createEvent: 'Create New Portal',
        noEvents: 'No portals found',
        loading: 'Loading portals...',
        confirmDelete: 'Are you sure you want to delete this portal?',
        edit: 'Edit',
        delete: 'Delete',
    },
    te: {
        title: 'పోర్టల్స్ నిర్వహణ',
        createEvent: 'కొత్త పోర్టల్‌ను సృష్టించండి',
        noEvents: 'పోర్టల్‌లు కనుగొనబడలేదు',
        loading: 'పోర్టల్‌లను లోడ్ చేస్తోంది...',
        confirmDelete: 'మీరు ఖచ్చితంగా ఈ పోర్టల్‌ను తొలగించాలనుకుంటున్నారా?',
        edit: 'సవరించు',
        delete: 'తొलగించు',
    },
    hi: {
        title: 'पोर्टल प्रबंधन',
        createEvent: 'नया पोर्टल बनाएं',
        noEvents: 'कोई पोर्टल नहीं मिला',
        loading: 'पोर्टल लोड हो रहे हैं...',
        confirmDelete: 'क्या आप वाकई इस पोर्टल को हटाना चाहते हैं?',
        edit: 'संपादित करें',
        delete: 'हटाएं',
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
            const response = await adminFetch('/api/admin/portals');
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
            const response = await adminFetch(`/api/admin/portals?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchPortals();
                adminFetch('/api/revalidate', {
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
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>{t.title}</h2>
                    <p className={styles.sectionSubtitle}>Manage external links and registration portals</p>
                </div>
                <button
                    className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} /> {t.createEvent}
                </button>
            </div>
 
            {portals.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <Globe size={48} style={{ color: 'var(--marvel-text-dim)', marginBottom: '20px', opacity: 0.5 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{t.noEvents}</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {portals.map((portal) => (
                        <div key={portal.id} className={styles.gridItem}>
                            <div className={styles.gridContent}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#3b82f6' }}>
                                        <Globe size={20} />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: 0 }}>
                                        {portal.title[language] || portal.title.en}
                                    </h3>
                                </div>
 
                                <p style={{ color: 'var(--marvel-text-dim)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', minHeight: '45px' }}>
                                    {(portal.description?.[language] || portal.description?.en || '').substring(0, 100)}...
                                </p>
 
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Globe size={14} style={{ color: '#3b82f6' }} />
                                    <a href={portal.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontWeight: '600', fontSize: '12px' }}>
                                        {portal.url.replace(/^https?:\/\//, '').substring(0, 25)}...
                                    </a>
                                </div>
                            </div>
 
                            <div className={styles.gridActions}>
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => setEditingPortal(portal)}
                                >
                                    <Edit2 size={14} /> {t.edit}
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnDanger}`}
                                    onClick={() => handleDelete(portal.id)}
                                >
                                    <Trash2 size={14} /> {t.delete}
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

            const response = await adminFetch(url, {
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
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{isEdit ? 'Edit Portal' : 'Add New Portal'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div className={styles.badge} style={{ width: 'calc(100% - 40px)', margin: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px', justifyContent: 'center' }}>{error}</div>}
                {translating && <div className={styles.badge} style={{ width: 'calc(100% - 40px)', margin: '10px 20px 0', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '10px', justifyContent: 'center' }}>Auto-translating to Hindi & Telugu...</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.modalBody}>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Target Web Address * (e.g. hackathon.com)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                required
                                placeholder="https://external-registration-link.com"
                            />
                        </div>

                        <div className={styles.tabs} style={{ display: 'flex', gap: '8px', marginTop: '32px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '16px' }}>
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
                                        <label className={styles.label}>Button Call-to-Action ({lang.toUpperCase()}) *</label>
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
                                            placeholder="e.g. Register for Hackathon"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Brief Subject Context ({lang.toUpperCase()})</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.description[lang]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                description: { ...formData.description, [lang]: e.target.value }
                                            })}
                                            onBlur={lang === 'en' ? (e) => handleAutoTranslate('description', e.target.value) : undefined}
                                            placeholder="A short snippet to show on hover..."
                                        />
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading} style={{ minWidth: '140px' }}>
                            {loading ? 'Propagating...' : (isEdit ? 'Update Link' : 'Authorize Portal')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
