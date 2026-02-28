'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Github, Linkedin, ExternalLink, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import styles from '../admin-content.module.css';
import { compressImageToDataURL } from '@/utils/image-compression';

export default function AdminDevelopers() {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Developer',
        image: '',
        github_url: '',
        linkedin_url: '',
        is_active: true,
        order_index: 0
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchDevs();
    }, []);

    const fetchDevs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/developers');
            const data = await res.json();
            if (data.developers) setDevelopers(data.developers);
        } catch (error) {
            console.error('Fetch devs error:', error);
        }
        setLoading(false);
    };

    const handleEdit = (dev) => {
        setIsEditing(dev.id);
        setFormData({ ...dev });
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({
            name: '',
            role: 'Developer',
            image: '',
            github_url: '',
            linkedin_url: '',
            is_active: true,
            order_index: 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const payload = isEditing ? { id: isEditing, ...formData } : formData;

        try {
            const res = await fetch('/api/admin/developers', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: isEditing ? 'Updated successfully' : 'Added successfully' });
                handleCancel();
                fetchDevs();
            } else {
                setMessage({ type: 'error', text: data.error || 'Something went wrong' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error' });
        }

        setTimeout(() => setMessage(null), 3000);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this developer?')) return;
        try {
            const res = await fetch(`/api/admin/developers?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Deleted successfully' });
                fetchDevs();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const dataUrl = await compressImageToDataURL(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.6
            });
            setFormData({ ...formData, image: dataUrl });
            setMessage({ type: 'success', text: 'Image processed successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Upload failed' });
        }
        setUploading(false);
        // Don't auto-hide error messages as quickly if they contain instructions
        setTimeout(() => setMessage(null), 10000);
    };

    return (
        <div className={styles.adminContent}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.sectionTitle}>Meet The Developers</h1>
                    <p className={styles.sectionSubtitle}>Manage the team behind the innovation</p>
                </div>
                {!isEditing && (
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => setIsEditing('new')}
                    >
                        <Plus size={18} /> Add Developer
                    </button>
                )}
            </div>

            {message && (
                <div className={`${styles.alert} ${styles[message.type]}`} style={{ marginBottom: '24px' }}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            {isEditing && (
                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ marginBottom: '48px' }}
                >
                    <h2 className={styles.modalTitle} style={{ marginBottom: '24px' }}>
                        {isEditing === 'new' ? 'Add New Developer' : 'Edit Developer'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Role</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="e.g. Developer"
                                />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                <label className={styles.label}>Developer Photo</label>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '16px',
                                        background: 'rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        border: '1px solid var(--marvel-border)'
                                    }}>
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={32} style={{ opacity: 0.2 }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="file"
                                            id="dev-photo"
                                            className={styles.input}
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <label htmlFor="dev-photo" className={`${styles.btn} ${styles.btnSecondary}`} style={{ cursor: 'pointer', margin: 0 }}>
                                                {uploading ? 'Uploading...' : 'Upload Image'}
                                            </label>
                                            {formData.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, image: '' })}
                                                    className={`${styles.btn} ${styles.btnDanger}`}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                                            Professional headshot recommended (Square aspect ratio)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Display Order</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.order_index}
                                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>GitHub URL</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.github_url}
                                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                    placeholder="GitHub URL"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>LinkedIn URL</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.linkedin_url}
                                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    placeholder="LinkedIn URL"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                            <label className={styles.checkboxLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--marvel-text)', fontWeight: '700', fontSize: '13px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Active Status (Visible on Homepage)
                            </label>
                        </div>

                        <div className={styles.btnGroup} style={{ marginTop: '32px', justifyContent: 'flex-start' }}>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                <Save size={18} /> {isEditing === 'new' ? 'Confirm Addition' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={handleCancel} className={`${styles.btn} ${styles.btnSecondary}`}>
                                <X size={18} /> Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className={styles.grid}>
                {developers.map((dev, index) => (
                    <motion.div
                        key={dev.id}
                        className={styles.gridItem}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div style={{ position: 'relative' }}>
                            {dev.image ? (
                                <img src={dev.image} alt={dev.name} className={styles.gridImage} />
                            ) : (
                                <div className={styles.gridImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)' }}>
                                    <ImageIcon size={48} style={{ opacity: 0.2 }} />
                                </div>
                            )}
                            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                                <span className={`${styles.badge} ${dev.is_active ? styles.badgeSuccess : styles.badgeError}`}>
                                    {dev.is_active ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.gridContent}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--marvel-text)' }}>{dev.name}</h3>
                            <p style={{ margin: '4px 0 16px', fontSize: '13px', color: '#3b82f6', fontWeight: '800', letterSpacing: '0.5px' }}>
                                {dev.role.toUpperCase()}
                            </p>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                {dev.github_url && (
                                    <a href={dev.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1a1f36', transition: '0.2s' }}>
                                        <Github size={20} />
                                    </a>
                                )}
                                {dev.linkedin_url && (
                                    <a href={dev.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', transition: '0.2s' }}>
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '800', opacity: 0.5 }}>#{dev.order_index}</span>
                            </div>

                            <div className={styles.gridActions}>
                                <button onClick={() => handleEdit(dev)} className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: '8px 12px' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(dev.id)} className={`${styles.btn} ${styles.btnDanger}`} style={{ padding: '8px 12px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {developers.length === 0 && !loading && (
                <div className={styles.emptyState} style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', color: 'rgba(0,0,0,0.3)', fontWeight: '700' }}>
                    <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <p>No developers available. Use the button at the top to add one!</p>
                </div>
            )}
        </div>
    );
}
