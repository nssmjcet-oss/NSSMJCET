'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '../admin-content.module.css';
import { adminFetch } from '@/utils/api-client';
import { Plus, Star, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL } from '@/utils/image-compression';

export default function FlagshipPage() {
    const { language } = useLanguage();
    const [flagships, setFlagships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => { fetchFlagships(); }, []);

    const fetchFlagships = async () => {
        try {
            const res = await adminFetch('/api/admin/flagship');
            const data = await res.json();
            if (res.ok) setFlagships(data.flagships || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this flagship campaign?')) return;
        await adminFetch(`/api/admin/flagship?id=${id}`, { method: 'DELETE' });
        fetchFlagships();
        revalidatePaths();
    };

    const revalidatePaths = () => {
        adminFetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/' }) }).catch(() => {});
    };

    if (loading) return <div className={styles.loading}><div className="spinner" /><p>Loading flagship campaigns...</p></div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Flagship Campaigns</h2>
                    <p className={styles.sectionSubtitle}>Manage the 4 signature NSS initiatives shown on the homepage</p>
                </div>
                <button className="marvelous-btn marvelous-btn-primary marvelous-btn-sm" onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> Add Campaign
                </button>
            </div>

            {flagships.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <Star size={48} style={{ color: 'var(--marvel-text-dim)', marginBottom: '20px', opacity: 0.4 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No flagship campaigns yet.</p>
                    <p style={{ color: 'var(--marvel-text-dim)', marginTop: '8px' }}>Add up to 4 campaigns to showcase on the homepage.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {flagships.map((fs) => (
                        <div key={fs.id} className={styles.gridItem}>
                            {fs.image && (
                                <img src={fs.image} alt="" className={styles.gridImage} style={{ aspectRatio: '3/4', objectFit: 'cover', maxHeight: '200px' }} />
                            )}
                            <div className={styles.gridContent}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                    {fs.tag?.en && (
                                        <span className={`${styles.badge} ${styles.badgeInfo}`}>{fs.tag.en}</span>
                                    )}
                                    {fs.linkedEventId && (
                                        <span className={`${styles.badge} ${styles.badgeSuccess}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ExternalLink size={10} /> Linked to Event
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                                    {fs.title?.en || 'Untitled'}
                                </h3>
                                <p style={{ color: 'var(--marvel-text-dim)', fontSize: '13px', lineHeight: '1.6' }}>
                                    {(fs.description?.en || '').substring(0, 120)}...
                                </p>
                                {fs.linkedEventId && (
                                    <p style={{ fontSize: '11px', color: '#60a5fa', marginTop: '8px', fontFamily: 'monospace' }}>
                                        Event ID: {fs.linkedEventId.substring(0, 20)}...
                                    </p>
                                )}
                            </div>
                            <div className={styles.gridActions}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setEditing(fs)}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(fs.id)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <FlagshipModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchFlagships(); revalidatePaths(); }} />
            )}
            {editing && (
                <FlagshipModal flagship={editing} onClose={() => setEditing(null)} onSuccess={() => { setEditing(null); fetchFlagships(); revalidatePaths(); }} />
            )}
        </div>
    );
}

function FlagshipModal({ flagship, onClose, onSuccess }) {
    const isEdit = !!flagship;
    const [activeTab, setActiveTab] = useState('en');
    const [events, setEvents] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        title: { en: flagship?.title?.en || '', te: flagship?.title?.te || '', hi: flagship?.title?.hi || '' },
        description: { en: flagship?.description?.en || '', te: flagship?.description?.te || '', hi: flagship?.description?.hi || '' },
        tag: { en: flagship?.tag?.en || '', te: flagship?.tag?.te || '', hi: flagship?.tag?.hi || '' },
        tagline: { en: flagship?.tagline?.en || '', te: flagship?.tagline?.te || '', hi: flagship?.tagline?.hi || '' },
        image: flagship?.image || '',
        linkedEventId: flagship?.linkedEventId || '',
        order: flagship?.order || 1,
    });

    useEffect(() => {
        // Fetch events to allow linking
        fetch('/api/events').then(r => r.json()).then(d => setEvents(d.events || [])).catch(() => {});
    }, []);

    const handleAutoTranslate = async (field, value) => {
        if (!value || value.trim().length < 3) return;
        setTranslating(true);
        try {
            const [te, hi] = await Promise.all([translateText(value, 'te'), translateText(value, 'hi')]);
            setForm(prev => ({ ...prev, [field]: { ...prev[field], te: prev[field].te || te, hi: prev[field].hi || hi } }));
        } catch (e) { console.error(e); }
        finally { setTranslating(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const dataUrl = await compressImageToDataURL(file, { maxWidth: 800, maxHeight: 1100, quality: 0.88 });
            setForm(prev => ({ ...prev, image: dataUrl }));
        } catch (err) { setError('Image upload failed: ' + err.message); }
        finally { setUploading(false); e.target.value = ''; }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.en) { setError('English title is required'); return; }
        if (!form.image) { setError('A portrait image is required'); return; }
        setLoading(true); setError('');
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? { id: flagship.id, ...form } : form;
            const res = await adminFetch('/api/admin/flagship', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) { onSuccess(); } else { setError(data.error || 'Failed to save'); }
        } catch (e) { setError('Failed to save'); }
        finally { setLoading(false); }
    };

    const multiLangFields = ['title', 'description', 'tag', 'tagline'];

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{isEdit ? 'Edit Flagship Campaign' : 'Add Flagship Campaign'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div style={{ margin: '16px 20px 0', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>{error}</div>}
                {translating && <div style={{ margin: '8px 20px 0', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '10px', fontSize: '13px', textAlign: 'center' }}>Auto-translating...</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className={styles.modalBody}>

                        {/* Portrait image uploader */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Portrait Image * <span style={{ color: '#9ca3af', fontWeight: '400' }}>(best ratio: 3:4)</span></label>
                            <input type="file" accept="image/*" className={styles.input} onChange={handleImageUpload} />
                            {uploading && <p style={{ marginTop: '8px', fontSize: '12px', color: '#60a5fa' }}>Compressing image...</p>}
                            {form.image && (
                                <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <img src={form.image} alt="" style={{ width: '100px', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <button type="button" onClick={() => setForm(p => ({ ...p, image: '' }))} style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
                                </div>
                            )}
                        </div>

                        {/* Link to Event */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Linked Event (for &quot;More Info&quot; button)</label>
                            <select
                                className={styles.select}
                                value={form.linkedEventId}
                                onChange={e => setForm(p => ({ ...p, linkedEventId: e.target.value }))}
                            >
                                <option value="">— No link —</option>
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.title?.en || ev.id} ({ev.academicYear || 'N/A'})
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>When selected, &quot;More Info&quot; button will open that event&apos;s detail modal on the Events page.</p>
                        </div>

                        {/* Display Order */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Display Order (1–4)</label>
                            <input type="number" min="1" max="4" className={styles.input} value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
                        </div>

                        {/* Lang tabs */}
                        <div className={styles.tabs} style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '16px' }}>
                            {['en', 'te', 'hi'].map(lang => (
                                <button key={lang} type="button"
                                    className={`${styles.btn} ${activeTab === lang ? styles.btnPrimary : styles.btnSecondary}`}
                                    onClick={() => setActiveTab(lang)}
                                    style={{ flex: 1, borderRadius: '12px', padding: '10px' }}
                                >
                                    {lang === 'en' ? 'English' : lang === 'te' ? 'తెలుగు' : 'हिंदी'}
                                </button>
                            ))}
                        </div>

                        {['en', 'te', 'hi'].map(lang => activeTab === lang && (
                            <div key={lang} style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Campaign Name ({lang.toUpperCase()}) *</label>
                                    <input type="text" className={styles.input} value={form.title[lang]}
                                        onChange={e => setForm(p => ({ ...p, title: { ...p.title, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('title', e.target.value) : undefined}
                                        placeholder="e.g. SPANDAN" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Short Tag ({lang.toUpperCase()}) — e.g. &quot;Saves Lives&quot;</label>
                                    <input type="text" className={styles.input} value={form.tag[lang]}
                                        onChange={e => setForm(p => ({ ...p, tag: { ...p.tag, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('tag', e.target.value) : undefined}
                                        placeholder="Short category tag" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tagline ({lang.toUpperCase()}) — e.g. &quot;Mega Blood Drive&quot;</label>
                                    <input type="text" className={styles.input} value={form.tagline[lang]}
                                        onChange={e => setForm(p => ({ ...p, tagline: { ...p.tagline, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('tagline', e.target.value) : undefined}
                                        placeholder="One-line descriptive subtitle" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Description ({lang.toUpperCase()})</label>
                                    <textarea className={styles.textarea} rows="3" value={form.description[lang]}
                                        onChange={e => setForm(p => ({ ...p, description: { ...p.description, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('description', e.target.value) : undefined}
                                        placeholder="Brief description of this flagship campaign..." />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>Cancel</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading || uploading} style={{ minWidth: '160px' }}>
                            {loading ? 'Saving...' : isEdit ? 'Update Campaign' : 'Publish Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
