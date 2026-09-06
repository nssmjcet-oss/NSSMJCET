'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '../admin-content.module.css';
import { adminFetch } from '@/utils/api-client';
import { Plus, Star, Edit2, Trash2, ExternalLink, Sparkles, Layers, Crop } from 'lucide-react';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL } from '@/utils/image-compression';
import ImageCropperModal from '@/components/ImageCropperModal';

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
        if (!confirm('Delete this flagship initiative?')) return;
        await adminFetch(`/api/admin/flagship?id=${id}`, { method: 'DELETE' });
        fetchFlagships();
        revalidatePaths();
    };

    const revalidatePaths = () => {
        adminFetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/' }) }).catch(() => {});
        adminFetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/initiatives' }) }).catch(() => {});
    };

    if (loading) return <div className={styles.loading}><div className="spinner" /><p>Loading flagship initiatives...</p></div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Flagship Initiatives CMS</h2>
                    <p className={styles.sectionSubtitle}>
                        Admin Single Source of Truth for MUNX NSS, Youth Parliament & signature campaigns
                    </p>
                </div>
                <button className="marvelous-btn marvelous-btn-primary marvelous-btn-sm" onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> Add Initiative
                </button>
            </div>

            {flagships.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <Star size={48} style={{ color: 'var(--marvel-text-dim)', marginBottom: '20px', opacity: 0.4 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No flagship initiatives yet.</p>
                    <p style={{ color: 'var(--marvel-text-dim)', marginTop: '8px' }}>Add MUNX NSS, Youth Parliament, or other major initiatives.</p>
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
                                    <span className={`${styles.badge} ${
                                        fs.status === 'ongoing' ? styles.badgeWarning :
                                        fs.status === 'completed' ? styles.badgeSuccess :
                                        styles.badgeInfo
                                    }`}>
                                        {fs.status ? fs.status.toUpperCase() : 'ACTIVE'}
                                    </span>
                                    {fs.animation_style && (
                                        <span className={`${styles.badge} ${styles.badgeSecondary}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Sparkles size={10} /> {fs.animation_style} animation
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
                                    {fs.title?.en || 'Untitled'}
                                </h3>
                                {fs.short_title && (
                                    <p style={{ color: '#FF9933', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        Short: {fs.short_title} | Slug: /{fs.slug || fs.id}
                                    </p>
                                )}
                                <p style={{ color: 'var(--marvel-text-dim)', fontSize: '13px', lineHeight: '1.6' }}>
                                    {(fs.description?.en || '').substring(0, 120)}...
                                </p>
                            </div>
                            <div className={styles.gridActions}>
                                {fs.slug && (
                                    <a
                                        href={`/initiatives/${fs.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <ExternalLink size={14} /> View Page
                                    </a>
                                )}
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
        short_title: flagship?.short_title || '',
        slug: flagship?.slug || '',
        initiativeType: flagship?.initiativeType || 'general',
        animation_style: flagship?.animation_style || 'default',
        animationPreset: flagship?.animationPreset || flagship?.animation_style || 'diplomatic',
        accentColor: flagship?.accentColor || 'saffron',
        interactiveTypography: flagship?.interactiveTypography !== undefined ? flagship?.interactiveTypography : true,
        status: flagship?.status || 'upcoming',
        tag: { en: flagship?.tag?.en || '', te: flagship?.tag?.te || '', hi: flagship?.tag?.hi || '' },
        tagline: { en: flagship?.tagline?.en || '', te: flagship?.tagline?.te || '', hi: flagship?.tagline?.hi || '' },
        description: { en: flagship?.description?.en || '', te: flagship?.description?.te || '', hi: flagship?.description?.hi || '' },
        about: { en: flagship?.about?.en || '', te: flagship?.about?.te || '', hi: flagship?.about?.hi || '' },
        highlights: flagship?.highlights || '',
        winners: flagship?.winners || '',
        image: flagship?.image || '',
        heroImage: flagship?.heroImage || '',
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

    const [cropper, setCropper] = useState({
        isOpen: false,
        imageSrc: '',
        field: '',
        aspectRatio: 16 / 9,
        title: 'Crop Image',
    });

    const handleImageSelect = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setCropper({
                isOpen: true,
                imageSrc: reader.result,
                field,
                aspectRatio: field === 'heroImage' ? 16 / 9 : 3 / 4,
                title: field === 'heroImage' ? 'Crop Hero Banner (16:9 Landscape)' : 'Crop Card Image (3:4 Portrait)'
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleOpenCropper = (field) => {
        if (!form[field]) return;
        setCropper({
            isOpen: true,
            imageSrc: form[field],
            field,
            aspectRatio: field === 'heroImage' ? 16 / 9 : 3 / 4,
            title: field === 'heroImage' ? 'Crop Hero Banner (16:9 Landscape)' : 'Crop Card Image (3:4 Portrait)'
        });
    };

    const handleCropComplete = (croppedDataUrl) => {
        setForm(prev => ({ ...prev, [cropper.field]: croppedDataUrl }));
    };

    const handleTitleBlur = (val) => {
        handleAutoTranslate('title', val);
        if (!form.slug && val) {
            const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setForm(prev => ({ ...prev, slug: generatedSlug }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.en) { setError('English title is required'); return; }
        if (!form.slug) { setError('Slug is required (e.g. munx-nss)'); return; }
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

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{isEdit ? 'Edit Flagship Initiative' : 'Add Flagship Initiative'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div style={{ margin: '16px 20px 0', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>{error}</div>}
                {translating && <div style={{ margin: '8px 20px 0', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '10px', fontSize: '13px', textAlign: 'center' }}>Auto-translating...</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className={styles.modalBody}>

                        {/* Top Architecture Controls */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Initiative Type *</label>
                                <select
                                    className={styles.select}
                                    value={form.initiativeType}
                                    onChange={e => {
                                        const type = e.target.value;
                                        setForm(p => ({
                                            ...p,
                                            initiativeType: type,
                                            animation_style: type === 'mun' ? 'mun' : type === 'youth_parliament' ? 'youth_parliament' : 'default'
                                        }));
                                    }}
                                >
                                    <option value="general">General Campaign</option>
                                    <option value="mun">MUN / MUNX NSS</option>
                                    <option value="youth_parliament">Youth Parliament</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Animation Preset *</label>
                                <select
                                    className={styles.select}
                                    value={form.animationPreset}
                                    onChange={e => setForm(p => ({ ...p, animationPreset: e.target.value, animation_style: e.target.value }))}
                                >
                                    <option value="diplomatic">Diplomatic (Fluid, Intellectual — MUN x NSS)</option>
                                    <option value="civic">Civic (Structured, Geometric — Youth Parliament)</option>
                                    <option value="editorial">Editorial (Refined baseline elevation)</option>
                                    <option value="campaign">Campaign (Dynamic, punchy)</option>
                                    <option value="minimal">Minimal (Subtle lift & accent color)</option>
                                    <option value="none">None (Static Typography)</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Brand Accent Color *</label>
                                <select
                                    className={styles.select}
                                    value={form.accentColor}
                                    onChange={e => setForm(p => ({ ...p, accentColor: e.target.value }))}
                                >
                                    <option value="saffron">Saffron (#FF9933 - Official)</option>
                                    <option value="green">Green (#138808 - Civic)</option>
                                    <option value="blue">Royal Blue (#2563eb)</option>
                                </select>
                            </div>
                        </div>

                        {/* Interactive Typography & Lifecycle Status */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Interactive Typography</label>
                                <select
                                    className={styles.select}
                                    value={form.interactiveTypography ? 'true' : 'false'}
                                    onChange={e => setForm(p => ({ ...p, interactiveTypography: e.target.value === 'true' }))}
                                >
                                    <option value="true">Enabled (Cursor Proximity Response)</option>
                                    <option value="false">Disabled (Static Render)</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Lifecycle Status *</label>
                                <select
                                    className={styles.select}
                                    value={form.status}
                                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                >
                                    <option value="upcoming">UPCOMING (Scheduled Initiative)</option>
                                    <option value="ongoing">ONGOING (Active Right Now)</option>
                                    <option value="completed">COMPLETED (Concluded / Archived Edition)</option>
                                    <option value="active">Active (Evergreen Initiative)</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        {/* Slug and Short Title */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Short Title (e.g. MUNX NSS, YP-2026)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={form.short_title}
                                    onChange={e => setForm(p => ({ ...p, short_title: e.target.value }))}
                                    placeholder="Used for interactive animations"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>URL Slug * (/initiatives/[slug])</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={form.slug}
                                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                    placeholder="e.g. munx-nss or youth-parliament"
                                    required
                                />
                            </div>
                        </div>

                        {/* Image uploads with Cropper support */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Portrait Card Image (3:4 ratio)</label>
                                <input type="file" accept="image/*" className={styles.input} onChange={e => handleImageSelect(e, 'image')} />
                                {form.image && (
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <img src={form.image} alt="" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                        <button type="button" onClick={() => handleOpenCropper('image')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,153,51,0.2)', color: '#FF9933', border: '1px solid rgba(255,153,51,0.3)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                                            <Crop size={12} />
                                            <span>Crop / Adjust</span>
                                        </button>
                                        <button type="button" onClick={() => setForm(p => ({ ...p, image: '' }))} style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Hero Landscape Banner (16:9 ratio)</label>
                                <input type="file" accept="image/*" className={styles.input} onChange={e => handleImageSelect(e, 'heroImage')} />
                                {form.heroImage && (
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <img src={form.heroImage} alt="" style={{ width: '120px', height: '67px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                        <button type="button" onClick={() => handleOpenCropper('heroImage')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,153,51,0.2)', color: '#FF9933', border: '1px solid rgba(255,153,51,0.3)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                                            <Crop size={12} />
                                            <span>Crop / Adjust</span>
                                        </button>
                                        <button type="button" onClick={() => setForm(p => ({ ...p, heroImage: '' }))} style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lang tabs */}
                        <div className={styles.tabs} style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '16px' }}>
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
                                    <label className={styles.label}>Initiative Full Name ({lang.toUpperCase()}) *</label>
                                    <input type="text" className={styles.input} value={form.title[lang]}
                                        onChange={e => setForm(p => ({ ...p, title: { ...p.title, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleTitleBlur(e.target.value) : undefined}
                                        placeholder="e.g. Model United Nations X NSS" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tag ({lang.toUpperCase()}) — e.g. &quot;Signature Initiative&quot;</label>
                                    <input type="text" className={styles.input} value={form.tag[lang]}
                                        onChange={e => setForm(p => ({ ...p, tag: { ...p.tag, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('tag', e.target.value) : undefined}
                                        placeholder="Category badge" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tagline / Theme ({lang.toUpperCase()})</label>
                                    <input type="text" className={styles.input} value={form.tagline[lang]}
                                        onChange={e => setForm(p => ({ ...p, tagline: { ...p.tagline, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('tagline', e.target.value) : undefined}
                                        placeholder="One-line descriptive theme" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Short Overview ({lang.toUpperCase()})</label>
                                    <textarea className={styles.textarea} rows="2" value={form.description[lang]}
                                        onChange={e => setForm(p => ({ ...p, description: { ...p.description, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('description', e.target.value) : undefined}
                                        placeholder="Card summary..." />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Detailed About & Context ({lang.toUpperCase()})</label>
                                    <textarea className={styles.textarea} rows="4" value={form.about[lang]}
                                        onChange={e => setForm(p => ({ ...p, about: { ...p.about, [lang]: e.target.value } }))}
                                        onBlur={lang === 'en' ? e => handleAutoTranslate('about', e.target.value) : undefined}
                                        placeholder="Complete charter, objectives, agenda, and structure of this initiative..." />
                                </div>
                            </div>
                        ))}

                        {/* Post-Event / Outcomes Section */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(255, 153, 51, 0.05)',
                            border: '1px solid rgba(255, 153, 51, 0.2)',
                            borderRadius: '16px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ color: '#FF9933', fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>
                                Outcomes, Resolutions & Recognition
                            </h4>
                            <p style={{ color: 'var(--marvel-text-dim)', fontSize: '12px', marginBottom: '12px' }}>
                                For completed or active editions, display key milestones, passing of resolutions, or best delegate awards.
                            </p>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Key Highlights & Milestones</label>
                                <textarea
                                    className={styles.textarea}
                                    rows="2"
                                    value={form.highlights}
                                    onChange={e => setForm(p => ({ ...p, highlights: e.target.value }))}
                                    placeholder="e.g. Over 300 delegates across 12 institutions. 4 major resolutions passed."
                                />
                            </div>
                            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.label}>Winners & Awards / Recognition</label>
                                <textarea
                                    className={styles.textarea}
                                    rows="2"
                                    value={form.winners}
                                    onChange={e => setForm(p => ({ ...p, winners: e.target.value }))}
                                    placeholder="e.g. Best Delegate UNHRC: John Doe | Best Delegation: MJCET Unit"
                                />
                            </div>
                        </div>

                        {/* Linked Event & Order */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Linked Event Schedule</label>
                                <select
                                    className={styles.select}
                                    value={form.linkedEventId}
                                    onChange={e => setForm(p => ({ ...p, linkedEventId: e.target.value }))}
                                >
                                    <option value="">— No event linked —</option>
                                    {events.map(ev => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.title?.en || ev.id} ({ev.academicYear || 'N/A'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Display Order (1-10)</label>
                                <input type="number" min="1" max="10" className={styles.input} value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
                            </div>
                        </div>

                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>Cancel</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading || uploading} style={{ minWidth: '160px' }}>
                            {loading ? 'Saving...' : isEdit ? 'Update Initiative' : 'Publish Initiative'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Image Cropper Modal */}
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

