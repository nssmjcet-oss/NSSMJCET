'use client';

import { useState, useEffect } from 'react';
import styles from '../admin-content.module.css';
import { adminFetch } from '@/utils/api-client';
import { Plus, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react';
import { compressImageToDataURL } from '@/utils/image-compression';

export default function AdminGalleryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await adminFetch('/api/admin/gallery');
            const data = await res.json();
            if (res.ok) setItems(data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this photograph?')) return;
        await adminFetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
        fetchGallery();
    };

    if (loading) return <div className={styles.loading}><div className="spinner" /><p>Loading gallery items...</p></div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Photo Gallery CMS</h2>
                    <p className={styles.sectionSubtitle}>Curate official event photographs, field drives & activity records</p>
                </div>
                <button className="marvelous-btn marvelous-btn-primary marvelous-btn-sm" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Photo
                </button>
            </div>

            {items.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <ImageIcon size={48} style={{ color: 'var(--marvel-text-dim)', marginBottom: '20px', opacity: 0.4 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No photos in the gallery yet.</p>
                    <p style={{ color: 'var(--marvel-text-dim)', marginTop: '8px' }}>Upload memorable moments from campaigns and community drives.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.gridItem}>
                            {item.image && (
                                <img src={item.image} alt={item.title || ''} className={styles.gridImage} style={{ height: '220px', objectFit: 'cover' }} />
                            )}
                            <div className={styles.gridContent}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span className={`${styles.badge} ${styles.badgeInfo}`}>{item.category || 'General'}</span>
                                    <span className={`${styles.badge} ${styles.badgeSecondary}`}>{item.academicYear || '2026-2027'}</span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
                                    {item.title || 'Untitled Photo'}
                                </h3>
                                {item.caption && (
                                    <p style={{ color: 'var(--marvel-text-dim)', fontSize: '13px' }}>
                                        {item.caption}
                                    </p>
                                )}
                            </div>
                            <div className={styles.gridActions}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setEditingItem(item)}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(item.id)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <GalleryModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchGallery(); }} />
            )}
            {editingItem && (
                <GalleryModal item={editingItem} onClose={() => setEditingItem(null)} onSuccess={() => { setEditingItem(null); fetchGallery(); }} />
            )}
        </div>
    );
}

function GalleryModal({ item, onClose, onSuccess }) {
    const isEdit = !!item;
    const [form, setForm] = useState({
        title: item?.title || '',
        caption: item?.caption || '',
        category: item?.category || 'General',
        academicYear: item?.academicYear || '2026-2027',
        order: item?.order || 1,
        image: item?.image || ''
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const dataUrl = await compressImageToDataURL(file, { maxWidth: 1400, maxHeight: 1000, quality: 0.82 });
            setForm(p => ({ ...p, image: dataUrl }));
        } catch (err) {
            setError('Image upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.image) {
            setError('A photograph is required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit ? { id: item.id, ...form } : form;
            const res = await adminFetch('/api/admin/gallery', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                onSuccess();
            } else {
                setError(data.error || 'Failed to save');
            }
        } catch (e) {
            setError('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{isEdit ? 'Edit Photograph' : 'Add Photograph'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {error && <div style={{ margin: '16px 20px 0', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Select Photo *</label>
                            <input type="file" accept="image/*" className={styles.input} onChange={handleUpload} />
                            {uploading && <p style={{ fontSize: '12px', color: '#60a5fa', marginTop: '6px' }}>Optimizing photo...</p>}
                            {form.image && (
                                <div style={{ marginTop: '12px', position: 'relative', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Title / Event Name</label>
                            <input type="text" className={styles.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mega Blood Drive 2026" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Caption / Description</label>
                            <textarea className={styles.textarea} rows="2" value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} placeholder="Brief context about this photograph..." />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select className={styles.select} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                    <option value="General">General Activities</option>
                                    <option value="Blood Donation">Blood Donation</option>
                                    <option value="Flagship Drives">Flagship Drives</option>
                                    <option value="Youth Parliament">Youth Parliament</option>
                                    <option value="MUN / Diplomacy">MUN / Diplomacy</option>
                                    <option value="Community Outreach">Community Outreach</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Academic Session</label>
                                <select className={styles.select} value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}>
                                    <option value="2026-2027">2026-2027</option>
                                    <option value="2025-2026">2025-2026</option>
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2023-2024">2023-2024</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Display Order (1-100)</label>
                            <input type="number" min="1" max="100" className={styles.input} value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>Cancel</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading || uploading} style={{ minWidth: '140px' }}>
                            {loading ? 'Saving...' : isEdit ? 'Update Photo' : 'Add to Gallery'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
