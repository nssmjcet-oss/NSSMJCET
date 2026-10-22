'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import styles from '../admin-content.module.css';
import galleryStyles from './gallery-admin.module.css';
import { adminFetch } from '@/utils/api-client';
import {
    Plus,
    Image as ImageIcon,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    ExternalLink,
    Sliders,
    Save,
    RotateCcw,
    CheckSquare,
    Square,
    Search,
    ArrowUpDown,
    UploadCloud,
    X,
    Calendar,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import { compressImageToDataURL, compressGalleryThumbnail, compressGalleryFullImage, validateImageFile } from '@/utils/image-compression';
import { MAX_GALLERY_PHOTOS, GALLERY_WARN_AT } from '@/lib/galleryConfig';
import { extractPhotoDate } from '@/utils/exifReader';

const DEFAULT_SETTINGS = {
    speedMultiplier: 2,
    maxDesktopCards: 60,
    maxMobileCards: 20,
    repeatPhotos: true,
    cardScale: 'medium',
    autoSpotlight: true,
    spotlightDelay: 6,
    dateFormat: 'DD MMM YYYY',
    showLogo: true,
    showMenuButton: true,
    showHeader: false,
    headerText: {
        en: {
            eyebrow: 'NSS MJCET · NOT ME BUT YOU',
            headingPlain: 'The Spirit of Our ',
            headingItalic: 'Volunteers',
            subtext: 'Real moments from the people who show up, work hard and enjoy every step of the journey.',
        },
        hi: {
            eyebrow: 'NSS MJCET · मैं नहीं, आप',
            headingPlain: 'हमारे स्वयंसेवकों की ',
            headingItalic: 'भावना',
            subtext: 'उन लोगों के असली पल, जो आगे आते हैं, मेहनत करते हैं और सफ़र के हर कदम का आनंद लेते हैं।',
        },
        te: {
            eyebrow: 'NSS MJCET · నేను కాదు, మీరు',
            headingPlain: 'మా వాలంటీర్ల ',
            headingItalic: 'స్ఫూర్తి',
            subtext: 'ముందుకు వచ్చి, కష్టపడి, ప్రయాణంలోని ప్రతి అడుగునూ ఆస్వాదించే వ్యక్తుల నిజమైన క్షణాలు.',
        },
    },
};

export default function AdminGalleryPage() {
    const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'settings'
    const [items, setItems] = useState([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
    const [photoCount, setPhotoCount] = useState(0);
    const [photoLimit, setPhotoLimit] = useState(MAX_GALLERY_PHOTOS);

    // Modals
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Filters and bulk selection
    const [searchQuery, setSearchQuery] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all' | 'visible' | 'hidden'
    const [sortBy, setSortBy] = useState('order_asc'); // 'order_asc' | 'date_desc' | 'date_asc'
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        fetchGalleryData();
    }, []);

    const showToast = (text, type = 'success') => {
        setStatusMessage({ text, type });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
    };

    const fetchGalleryData = async () => {
        setLoading(true);
        try {
            const res = await adminFetch('/api/admin/gallery');
            const data = await res.json();
            if (res.ok) {
                setItems(data.items || []);
                setPhotoCount(data.photoCount ?? (data.items || []).length);
                setPhotoLimit(data.photoLimit ?? MAX_GALLERY_PHOTOS);
                if (data.settings) {
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        ...data.settings,
                        headerText: {
                            ...DEFAULT_SETTINGS.headerText,
                            ...(data.settings.headerText || {}),
                        },
                    });
                }
            } else {
                showToast(data.error || 'Failed to load gallery', 'error');
            }
        } catch (e) {
            showToast('Network error loading gallery', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Toggle Visibility ──
    const handleToggleHide = async (id, currentHidden) => {
        try {
            const res = await adminFetch('/api/admin/gallery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isHidden: !currentHidden }),
            });
            if (res.ok) {
                setItems((prev) =>
                    prev.map((it) => (it.id === id ? { ...it, isHidden: !currentHidden } : it))
                );
                showToast(currentHidden ? 'Photo is now visible on gallery' : 'Photo hidden from gallery');
            }
        } catch (e) {
            showToast('Failed to update visibility', 'error');
        }
    };

    // ── Delete Item ──
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this photo?')) return;
        try {
            const res = await adminFetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                const data = await res.json();
                setItems((prev) => prev.filter((it) => it.id !== id));
                setPhotoCount(data.photoCount ?? (items.length - 1));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                showToast('Photo deleted successfully');
            }
        } catch (e) {
            showToast('Failed to delete photo', 'error');
        }
    };

    // ── Bulk Actions ──
    const handleSelectAll = () => {
        if (selectedIds.size === filteredItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map((i) => i.id)));
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulkHide = async (hideState) => {
        if (selectedIds.size === 0) return;
        const action = hideState ? 'bulk_hide' : 'bulk_show';
        try {
            const res = await adminFetch('/api/admin/gallery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
            });
            if (res.ok) {
                setItems((prev) =>
                    prev.map((it) => (selectedIds.has(it.id) ? { ...it, isHidden: hideState } : it))
                );
                showToast(`Updated ${selectedIds.size} photos`);
                setSelectedIds(new Set());
            }
        } catch (e) {
            showToast('Bulk update failed', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected photos?`)) return;
        try {
            const res = await adminFetch('/api/admin/gallery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_delete', ids: Array.from(selectedIds) }),
            });
            if (res.ok) {
                const data = await res.json();
                setItems((prev) => prev.filter((it) => !selectedIds.has(it.id)));
                setPhotoCount(data.photoCount ?? Math.max(0, photoCount - selectedIds.size));
                showToast(`Deleted ${selectedIds.size} photos`);
                setSelectedIds(new Set());
            }
        } catch (e) {
            showToast('Bulk delete failed', 'error');
        }
    };

    // ── Reorder ──
    const handleMoveItem = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

        const newItems = [...filteredItems];
        const [moved] = newItems.splice(index, 1);
        newItems.splice(targetIndex, 0, moved);

        const updatedWithOrder = newItems.map((item, idx) => ({
            id: item.id,
            order: idx,
        }));

        setItems((prev) => {
            const map = new Map(updatedWithOrder.map((u) => [u.id, u.order]));
            return prev.map((it) => (map.has(it.id) ? { ...it, order: map.get(it.id) } : it));
        });

        try {
            await adminFetch('/api/admin/gallery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reorder', items: updatedWithOrder }),
            });
        } catch (e) {
            showToast('Reorder failed', 'error');
        }
    };

    // ── Save Settings ──
    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await adminFetch('/api/admin/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save_settings', settings }),
            });
            if (res.ok) {
                showToast('Gallery settings saved successfully');
            } else {
                showToast('Failed to save settings', 'error');
            }
        } catch (e) {
            showToast('Network error saving settings', 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    // ── Filter & Sort ──
    const filteredItems = useMemo(() => {
        return items
            .filter((it) => {
                if (visibilityFilter === 'visible' && it.isHidden) return false;
                if (visibilityFilter === 'hidden' && !it.isHidden) return false;
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return it.date?.toLowerCase().includes(q) || false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'date_desc') return (b.date || '').localeCompare(a.date || '');
                if (sortBy === 'date_asc') return (a.date || '').localeCompare(b.date || '');
                return (a.order ?? 0) - (b.order ?? 0);
            });
    }, [items, visibilityFilter, searchQuery, sortBy]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
                <p>Loading Drifting Gallery CMS...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Page Header */}
            <div className={styles.pageHeader} style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 className={styles.sectionTitle}>Drifting Gallery CMS</h2>
                    <p className={styles.sectionSubtitle}>
                        Manage drifting moments, upload photos with EXIF date detection, and configure 60fps drift physics
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link
                        href="/gallery"
                        target="_blank"
                        rel="noreferrer"
                        className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <ExternalLink size={15} /> View Gallery
                    </Link>

                    <button
                        className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                        onClick={() => setShowUploadModal(true)}
                        disabled={photoCount >= photoLimit}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: photoCount >= photoLimit ? 0.5 : 1, cursor: photoCount >= photoLimit ? 'not-allowed' : 'pointer' }}
                        title={photoCount >= photoLimit ? `Gallery full (${photoLimit}/${photoLimit}). Delete photos to add more.` : 'Upload new photos'}
                    >
                        <UploadCloud size={16} /> {photoCount >= photoLimit ? 'Gallery Full' : 'Upload Photos'}
                    </button>
                </div>
            </div>

            {/* Photo Library Capacity Bar */}
            {activeTab === 'photos' && (() => {
                const pct = Math.min(100, Math.round((photoCount / photoLimit) * 100));
                const isFull = photoCount >= photoLimit;
                const isWarn = !isFull && photoCount >= GALLERY_WARN_AT;
                const barColor = isFull ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
                return (
                    <div style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '14px', background: isFull ? 'rgba(239,68,68,0.08)' : isWarn ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.06)', border: `1px solid ${isFull ? 'rgba(239,68,68,0.25)' : isWarn ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.15)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: isFull ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981' }}>
                                {isFull ? '🚫 Gallery Full' : isWarn ? '⚠️ Almost Full' : '📷 Photo Library'}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                                {photoCount} / {photoLimit} photos
                            </span>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                        </div>
                        {isFull && (
                            <p style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                                Gallery is full. Delete one or more photos to upload new ones.
                            </p>
                        )}
                        {isWarn && !isFull && (
                            <p style={{ marginTop: '8px', fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>
                                {photoLimit - photoCount} slot{photoLimit - photoCount !== 1 ? 's' : ''} remaining before the gallery is full.
                            </p>
                        )}
                    </div>
                );
            })()}

            {/* Toast Notification */}
            {statusMessage.text && (
                <div
                    style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background:
                            statusMessage.type === 'error'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                        color: statusMessage.type === 'error' ? '#ef4444' : '#10b981',
                        border: `1px solid ${statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    }}
                >
                    <span>{statusMessage.text}</span>
                    <button
                        onClick={() => setStatusMessage({ text: '', type: '' })}
                        style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '12px' }}>
                <button
                    onClick={() => setActiveTab('photos')}
                    className={`marvelous-btn marvelous-btn-sm ${activeTab === 'photos' ? 'marvelous-btn-primary' : 'marvelous-btn-outline'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: activeTab === 'photos' ? '#ffffff' : '#1e293b' }}
                >
                    <ImageIcon size={16} /> Photo Moments ({items.length})
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`marvelous-btn marvelous-btn-sm ${activeTab === 'settings' ? 'marvelous-btn-primary' : 'marvelous-btn-outline'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: activeTab === 'settings' ? '#ffffff' : '#1e293b' }}
                >
                    <Sliders size={16} /> Gallery Physics & Display Settings
                </button>
            </div>

            {/* ═══════════ TAB 1: PHOTOS MANAGER ═══════════ */}
            {activeTab === 'photos' && (
                <>
                    {/* Controls & Filter Bar */}
                    <div
                        className={galleryStyles.adminCard}
                        style={{
                            padding: '16px 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '14px',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {/* Search & Filters */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                            <div style={{ position: 'relative', minWidth: '220px' }}>
                                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    className={galleryStyles.textInput}
                                    placeholder="Search date (e.g. 2026-03)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                                />
                            </div>

                            <select
                                className={galleryStyles.selectInput}
                                value={visibilityFilter}
                                onChange={(e) => setVisibilityFilter(e.target.value)}
                                style={{ height: '40px', fontSize: '13px', width: 'auto', minWidth: '130px' }}
                            >
                                <option value="all">All Photos</option>
                                <option value="visible">Visible Only</option>
                                <option value="hidden">Hidden Only</option>
                            </select>

                            <select
                                className={galleryStyles.selectInput}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{ height: '40px', fontSize: '13px', width: 'auto', minWidth: '160px' }}
                            >
                                <option value="order_asc">Sort: Custom Order</option>
                                <option value="date_desc">Sort: Date (Newest)</option>
                                <option value="date_asc">Sort: Date (Oldest)</option>
                            </select>
                        </div>

                        {/* Bulk Action Controls */}
                        {selectedIds.size > 0 && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-accent-gold, #C69A43)' }}>
                                    {selectedIds.size} selected
                                </span>
                                <button
                                    onClick={() => handleBulkHide(false)}
                                    className={galleryStyles.actionBtn}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                    title="Make selected visible on gallery"
                                >
                                    <Eye size={14} /> Show
                                </button>
                                <button
                                    onClick={() => handleBulkHide(true)}
                                    className={galleryStyles.actionBtn}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                    title="Hide selected from gallery"
                                >
                                    <EyeOff size={14} /> Hide
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className={galleryStyles.dangerBtn}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                    title="Delete selected"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Select All Row */}
                    {filteredItems.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '8px' }}>
                            <button
                                onClick={handleSelectAll}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                }}
                            >
                                {selectedIds.size === filteredItems.length ? <CheckSquare size={16} color="#C69A43" /> : <Square size={16} color="#64748b" />}
                                {selectedIds.size === filteredItems.length ? 'Deselect All' : 'Select All Filtered'}
                            </button>
                        </div>
                    )}

                    {/* Photo Grid */}
                    {filteredItems.length === 0 ? (
                        <div className={galleryStyles.adminCard} style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <ImageIcon size={44} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                            <p style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>No photos found matching your filter.</p>
                            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                                Click &quot;Upload Photos&quot; above to add new moments.
                            </p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '20px',
                            }}
                        >
                            {filteredItems.map((item, index) => {
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className={`${galleryStyles.photoCard} ${isSelected ? galleryStyles.photoCardSelected : ''}`}
                                    >
                                        {/* Selection Checkbox */}
                                        <div
                                            onClick={() => handleToggleSelect(item.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '18px',
                                                left: '18px',
                                                zIndex: 5,
                                                cursor: 'pointer',
                                                background: 'rgba(0,0,0,0.6)',
                                                borderRadius: '6px',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {isSelected ? <CheckSquare size={16} color="#C69A43" /> : <Square size={16} color="#fff" />}
                                        </div>

                                        {/* Visibility Badge */}
                                        <div style={{ position: 'absolute', top: '18px', right: '18px', zIndex: 5 }}>
                                            <span
                                                className={`${styles.badge} ${item.isHidden ? styles.badgeError : styles.badgeSuccess}`}
                                                style={{ fontSize: '10px', padding: '3px 8px' }}
                                            >
                                                {item.isHidden ? 'Hidden' : 'Visible'}
                                            </span>
                                        </div>

                                        {/* Image Preview */}
                                        <div
                                            style={{
                                                position: 'relative',
                                                width: '100%',
                                                aspectRatio: '1 / 1',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                background: '#1A2438',
                                            }}
                                        >
                                            <img
                                                src={item.thumbnail || item.image}
                                                alt={`Moment ${item.date}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Date and Order Info */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} color="#C69A43" />
                                                <span className={galleryStyles.photoDate}>
                                                    {item.date}
                                                </span>
                                            </div>

                                            {/* Manual Order Controls */}
                                            {sortBy === 'order_asc' && (
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => handleMoveItem(index, -1)}
                                                        disabled={index === 0}
                                                        className={galleryStyles.orderBtn}
                                                        title="Move earlier in drift sequence"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', padding: '0 4px' }}>
                                                        #{item.order ?? index}
                                                    </span>
                                                    <button
                                                        onClick={() => handleMoveItem(index, 1)}
                                                        disabled={index === filteredItems.length - 1}
                                                        className={galleryStyles.orderBtn}
                                                        title="Move later in drift sequence"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                                            <button
                                                onClick={() => handleToggleHide(item.id, item.isHidden)}
                                                className={galleryStyles.actionBtn}
                                                style={{ flex: 1, padding: '7px 8px', fontSize: '12px' }}
                                                title={item.isHidden ? 'Show on gallery' : 'Hide from gallery'}
                                            >
                                                {item.isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                                                {item.isHidden ? ' Show' : ' Hide'}
                                            </button>

                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className={galleryStyles.actionBtn}
                                                style={{ padding: '7px 10px', fontSize: '12px' }}
                                                title="Edit date or replace photo"
                                            >
                                                <Edit2 size={13} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className={galleryStyles.dangerBtn}
                                                style={{ padding: '7px 10px', fontSize: '12px' }}
                                                title="Delete photo"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ═══════════ TAB 2: GALLERY SETTINGS ═══════════ */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings}>
                    <div className={galleryStyles.adminCard} style={{ maxWidth: '840px', margin: '0 auto 24px' }}>
                        <h3 className={galleryStyles.cardTitle}>
                            Motion & Physics Controls
                        </h3>
                        <p className={galleryStyles.cardSubtitle}>
                            Controls the single 60fps rAF drift loop, card counts, and layer scaling across desktop and mobile.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                            {/* Speed Multiplier */}
                            <div className={styles.formGroup}>
                                <label className={galleryStyles.fieldLabel}>
                                    Speed Multiplier (Default 2x)
                                    <span style={{ marginLeft: '8px', color: '#C69A43', fontWeight: '800' }}>
                                        {settings.speedMultiplier}x
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="4"
                                    step="0.25"
                                    value={settings.speedMultiplier}
                                    onChange={(e) => setSettings((s) => ({ ...s, speedMultiplier: parseFloat(e.target.value) }))}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                                <span className={galleryStyles.helperText}>
                                    Base 40px/s × {settings.speedMultiplier} = {(40 * settings.speedMultiplier).toFixed(0)}px/s drift
                                </span>
                            </div>

                            {/* Card Size Scale */}
                            <div className={styles.formGroup}>
                                <label className={galleryStyles.fieldLabel}>Card Size Scale</label>
                                <select
                                    className={galleryStyles.selectInput}
                                    value={settings.cardScale}
                                    onChange={(e) => setSettings((s) => ({ ...s, cardScale: e.target.value }))}
                                >
                                    <option value="small">Small (~75% · Far 68px / Mid 98px / Near 128px)</option>
                                    <option value="medium">Medium (Default · Far 90px / Mid 130px / Near 170px - Recommended)</option>
                                    <option value="large">Large (~125% · Far 112px / Mid 162px / Near 212px)</option>
                                </select>
                            </div>

                            {/* Max Cards Desktop */}
                            <div className={styles.formGroup}>
                                <label className={galleryStyles.fieldLabel}>Max Desktop Cards Cap</label>
                                <input
                                    type="number"
                                    min="6"
                                    max="80"
                                    className={galleryStyles.textInput}
                                    value={settings.maxDesktopCards}
                                    onChange={(e) => setSettings((s) => ({ ...s, maxDesktopCards: parseInt(e.target.value, 10) || 60 }))}
                                />
                                <span className={galleryStyles.helperText}>
                                    Area density target: 1920x1080 ~36, 1440x900 ~22 (cap up to 80)
                                </span>
                            </div>

                            {/* Max Cards Mobile */}
                            <div className={styles.formGroup}>
                                <label className={galleryStyles.fieldLabel}>Max Mobile Cards Cap</label>
                                <input
                                    type="number"
                                    min="4"
                                    max="40"
                                    className={galleryStyles.textInput}
                                    value={settings.maxMobileCards}
                                    onChange={(e) => setSettings((s) => ({ ...s, maxMobileCards: parseInt(e.target.value, 10) || 20 }))}
                                />
                                <span className={galleryStyles.helperText}>
                                    Area density target: phone ~9, tablet ~16 (cap up to 40)
                                </span>
                            </div>

                            {/* Repeat Photos */}
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label className={galleryStyles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={settings.repeatPhotos !== false}
                                        onChange={(e) => setSettings((s) => ({ ...s, repeatPhotos: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Repeat Photos to Fill Screen (Default ON)
                                </label>
                                <span className={galleryStyles.helperText}>
                                    When library has fewer photos than the target screen density, reuses photos evenly across the field without placing duplicates next to each other.
                                </span>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

                        {/* Spotlight Controls */}
                        <h3 className={galleryStyles.cardTitle}>
                            Auto-Spotlight & Date Format
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={galleryStyles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={settings.autoSpotlight}
                                        onChange={(e) => setSettings((s) => ({ ...s, autoSpotlight: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Enable Idle Auto-Spotlight
                                </label>
                                <span className={galleryStyles.helperText}>
                                    Enlarges a random photo when user is idle
                                </span>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={galleryStyles.fieldLabel}>Spotlight Idle Delay (Seconds)</label>
                                <input
                                    type="number"
                                    min="2"
                                    max="30"
                                    disabled={!settings.autoSpotlight}
                                    className={galleryStyles.textInput}
                                    value={settings.spotlightDelay}
                                    onChange={(e) => setSettings((s) => ({ ...s, spotlightDelay: parseInt(e.target.value, 10) || 6 }))}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={galleryStyles.fieldLabel}>Date Pill Format</label>
                                <select
                                    className={galleryStyles.selectInput}
                                    value={settings.dateFormat}
                                    onChange={(e) => setSettings((s) => ({ ...s, dateFormat: e.target.value }))}
                                >
                                    <option value="DD MMM YYYY">14 Mar 2026 (DD MMM YYYY)</option>
                                    <option value="MMM DD, YYYY">Mar 14, 2026 (MMM DD, YYYY)</option>
                                    <option value="YYYY-MM-DD">2026-03-14 (ISO YYYY-MM-DD)</option>
                                    <option value="DD/MM/YYYY">14/03/2026 (DD/MM/YYYY)</option>
                                </select>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

                        {/* Navigation and Logo Controls */}
                        <h3 className={galleryStyles.cardTitle}>
                            Full-Screen Navigation Elements
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={galleryStyles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={settings.showLogo}
                                        onChange={(e) => setSettings((s) => ({ ...s, showLogo: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Show Top-Left NSS Logo
                                </label>
                                <span className={galleryStyles.helperText}>
                                    64px desktop / 48px mobile logo linking to Home
                                </span>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={galleryStyles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={settings.showMenuButton}
                                        onChange={(e) => setSettings((s) => ({ ...s, showMenuButton: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Show Floating Menu Button
                                </label>
                                <span className={galleryStyles.helperText}>
                                    52px desktop / 46px mobile circular hamburger button
                                </span>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={galleryStyles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={settings.showHeader}
                                        onChange={(e) => setSettings((s) => ({ ...s, showHeader: e.target.checked }))}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    Show Hero Header Text (Default OFF)
                                </label>
                                <span className={galleryStyles.helperText}>
                                    If ON, shows Stories of Service / Spirit header over cards
                                </span>
                            </div>
                        </div>

                        {/* Optional Header Text Strings */}
                        {settings.showHeader && (
                            <div className={galleryStyles.langContainer}>
                                <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '14px', color: '#C69A43' }}>
                                    Header Text Content (Multilingual)
                                </h4>

                                {['en', 'hi', 'te'].map((langKey) => (
                                    <div key={langKey} style={{ marginBottom: '16px' }}>
                                        <h5 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#334155', marginBottom: '8px' }}>
                                            {langKey === 'en' ? 'English (EN)' : langKey === 'hi' ? 'Hindi (हि)' : 'Telugu (తె)'}
                                        </h5>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                className={galleryStyles.textInput}
                                                placeholder="Eyebrow text"
                                                value={settings.headerText?.[langKey]?.eyebrow || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSettings((prev) => ({
                                                        ...prev,
                                                        headerText: {
                                                            ...prev.headerText,
                                                            [langKey]: { ...prev.headerText[langKey], eyebrow: val },
                                                        },
                                                    }));
                                                }}
                                            />
                                            <input
                                                type="text"
                                                className={galleryStyles.textInput}
                                                placeholder="Heading Plain + Italic (e.g. Spirit of Our *Volunteers*)"
                                                value={`${settings.headerText?.[langKey]?.headingPlain || ''}*${settings.headerText?.[langKey]?.headingItalic || ''}*`}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const parts = val.split('*');
                                                    setSettings((prev) => ({
                                                        ...prev,
                                                        headerText: {
                                                            ...prev.headerText,
                                                            [langKey]: {
                                                                ...prev.headerText[langKey],
                                                                headingPlain: parts[0] || '',
                                                                headingItalic: parts[1] || '',
                                                            },
                                                        },
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className={galleryStyles.textInput}
                                            placeholder="Subtext description"
                                            value={settings.headerText?.[langKey]?.subtext || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    headerText: {
                                                        ...prev.headerText,
                                                        [langKey]: { ...prev.headerText[langKey], subtext: val },
                                                    },
                                                }));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Save & Reset Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Reset all gallery settings to defaults?')) {
                                        setSettings(DEFAULT_SETTINGS);
                                    }
                                }}
                                className="marvelous-btn marvelous-btn-outline"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}
                            >
                                <RotateCcw size={15} /> Reset Defaults
                            </button>

                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="marvelous-btn marvelous-btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center' }}
                            >
                                <Save size={16} /> {savingSettings ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
            {/* ═══════════ UPLOAD MODAL (Single or Multi-Photo with EXIF) ═══════════ */}
            {showUploadModal && (
                <MultiPhotoUploadModal
                    photoCount={photoCount}
                    photoLimit={photoLimit}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={(newCount) => {
                        setShowUploadModal(false);
                        if (newCount !== undefined) setPhotoCount(newCount);
                        fetchGalleryData();
                        showToast('Photos uploaded successfully');
                    }}
                />
            )}

            {/* ═══════════ EDIT MODAL ═══════════ */}
            {editingItem && (
                <EditPhotoModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSuccess={() => {
                        setEditingItem(null);
                        fetchGalleryData();
                        showToast('Photo updated successfully');
                    }}
                />
            )}
        </div>
    );
}

/**
 * Multi-Photo Upload Modal with auto-EXIF date detection & dual-size compression
 */
function MultiPhotoUploadModal({ photoCount = 0, photoLimit = 60, onClose, onSuccess }) {
    const [stagedFiles, setStagedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);
    const freeSlots = Math.max(0, photoLimit - photoCount);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setErrorMessage('');
        const newStaged = [];

        for (const file of files) {
            const validation = validateImageFile(file, { maxSizeBytes: 15 * 1024 * 1024 });
            if (!validation.valid) {
                setErrorMessage(validation.error);
                continue;
            }

            // Extract EXIF date or fallback to file modified date
            const dateStr = await extractPhotoDate(file);
            const previewUrl = URL.createObjectURL(file);

            newStaged.push({
                file,
                previewUrl,
                date: dateStr,
                name: file.name,
            });
        }

        setStagedFiles((prev) => {
            const combined = [...prev, ...newStaged];
            const totalFree = Math.max(0, freeSlots - prev.length);
            if (newStaged.length > totalFree) {
                const skipped = newStaged.length - totalFree;
                if (skipped > 0) setErrorMessage(`${skipped} photo${skipped > 1 ? 's were' : ' was'} skipped — only ${totalFree} slot${totalFree !== 1 ? 's' : ''} remaining in the gallery (limit: ${photoLimit}).`);
            }
            return combined.slice(0, freeSlots);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveStaged = (index) => {
        setStagedFiles((prev) => {
            const next = [...prev];
            URL.revokeObjectURL(next[index].previewUrl);
            next.splice(index, 1);
            return next;
        });
    };

    const handleDateChange = (index, newDate) => {
        setStagedFiles((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], date: newDate };
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (stagedFiles.length === 0) {
            setErrorMessage('Please select at least one photo to upload.');
            return;
        }

        setUploading(true);
        setErrorMessage('');
        setProgress(10);

        try {
            const photosPayload = [];
            const total = stagedFiles.length;

            for (let i = 0; i < total; i++) {
                const item = stagedFiles[i];

                // 1. Generate optimized ~400px WebP thumbnail (target ≤ 30 KB)
                const thumbDataUrl = await compressGalleryThumbnail(item.file);

                // 2. Generate full-size image (max 2000px, target ≤ 400 KB)
                const fullDataUrl = await compressGalleryFullImage(item.file);

                photosPayload.push({
                    thumbnail: thumbDataUrl,
                    image: fullDataUrl,
                    date: item.date,
                    order: i,
                    isHidden: false,
                });

                setProgress(Math.round(((i + 1) / total) * 80) + 10);
            }

            const res = await adminFetch('/api/admin/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photos: photosPayload }),
            });

            const data = await res.json();
            if (res.ok) {
                setProgress(100);
                if (data.warning) setErrorMessage(data.warning);
                onSuccess(data.photoCount);
            } else {
                setErrorMessage(data.error || 'Upload failed');
            }
        } catch (err) {
            setErrorMessage('Network error during upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '640px', width: '92vw' }}
            >
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Upload Volunteer Photos</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ×
                    </button>
                </div>

                {errorMessage && (
                    <div
                        style={{
                            margin: '16px 20px 0',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            fontSize: '13px',
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.modalBody}>
                        {/* Drop / Select Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed rgba(255,255,255,0.18)',
                                borderRadius: '16px',
                                padding: '32px 20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s ease',
                                marginBottom: '20px',
                            }}
                        >
                            <UploadCloud size={38} color="#C69A43" style={{ marginBottom: '10px' }} />
                            <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                                Click or drag photos here (Multi-select supported)
                            </p>
                            <p style={{ color: 'var(--marvel-text-dim)', fontSize: '12px', marginTop: '4px' }}>
                                JPG, PNG, WebP up to 15MB each. EXIF dates are detected automatically.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Staged Photos List */}
                        {stagedFiles.length > 0 && (
                            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '800', color: '#C69A43' }}>
                                    {stagedFiles.length} photo{stagedFiles.length > 1 ? 's' : ''} ready to upload:
                                </p>
                                {stagedFiles.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            background: 'rgba(255,255,255,0.08)',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                        }}
                                    >
                                        <img
                                            src={item.previewUrl}
                                            alt=""
                                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                {item.name}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <Calendar size={13} color="#C69A43" />
                                                <input
                                                    type="date"
                                                    value={item.date}
                                                    onChange={(e) => handleDateChange(idx, e.target.value)}
                                                    style={{
                                                        height: '32px',
                                                        fontSize: '12px',
                                                        padding: '2px 8px',
                                                        width: '140px',
                                                        background: 'rgba(15, 23, 42, 0.95)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(255,255,255,0.25)',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStaged(idx)}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                                            title="Remove"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Progress Bar */}
                        {uploading && (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                    <span style={{ color: '#60a5fa' }}>Generating thumbnails & uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            background: 'var(--color-accent-gold, #C69A43)',
                                            transition: 'width 0.2s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose} disabled={uploading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            disabled={uploading || stagedFiles.length === 0}
                            style={{ minWidth: '140px' }}
                        >
                            {uploading ? 'Processing...' : `Upload (${stagedFiles.length})`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * Edit Photo Modal (Edit Date or Replace Image)
 */
function EditPhotoModal({ item, onClose, onSuccess }) {
    const [date, setDate] = useState(item.date || '');
    const [order, setOrder] = useState(item.order ?? 0);
    const [isHidden, setIsHidden] = useState(!!item.isHidden);
    const [replacementFile, setReplacementFile] = useState(null);
    const [replacementPreview, setReplacementPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReplaceFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const val = validateImageFile(file);
        if (!val.valid) {
            setError(val.error);
            return;
        }

        const autoDate = await extractPhotoDate(file);
        setDate(autoDate);
        setReplacementFile(file);
        setReplacementPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                id: item.id,
                date,
                order: Number(order),
                isHidden,
            };

            if (replacementFile) {
                payload.thumbnail = await compressGalleryThumbnail(replacementFile);
                payload.image = await compressGalleryFullImage(replacementFile);
            }

            const res = await adminFetch('/api/admin/gallery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update photo');
            }
        } catch (err) {
            setError('Update failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Edit Photo Moment</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{ margin: '16px 20px 0', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        {/* Current / Replacement Preview */}
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <img
                                src={replacementPreview || item.thumbnail || item.image}
                                alt=""
                                style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>

                        {/* Replace Photo File */}
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#e2e8f0' }}>Replace Photo (Optional)</label>
                            <input type="file" accept="image/*" className={styles.input} onChange={handleReplaceFile} style={{ color: '#ffffff' }} />
                        </div>

                        {/* Date Picker */}
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#e2e8f0' }}>Moment Date *</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px' }}
                            />
                        </div>

                        {/* Display Order */}
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={{ color: '#e2e8f0' }}>Display Order Sequence</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                                style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px' }}
                            />
                        </div>

                        {/* Hidden Toggle */}
                        <div className={styles.formGroup}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                                <input
                                    type="checkbox"
                                    checked={isHidden}
                                    onChange={(e) => setIsHidden(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Hide this photo from gallery
                            </label>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
