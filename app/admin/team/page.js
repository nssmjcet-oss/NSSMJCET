'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';
import { translateText } from '@/utils/translation';
import { compressImageToDataURL, validateImageFile, compressMemberPhoto } from '@/utils/image-compression';
import { adminFetch } from '@/utils/api-client';
import { Award, Check, Plus, ShieldCheck } from 'lucide-react';

export default function TeamPage() {
    const { user } = useAuth();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [selectedAdminYear, setSelectedAdminYear] = useState('2025-2026');
    const [customYears, setCustomYears] = useState(['2025-2026']);
    const [newYearInput, setNewYearInput] = useState('');
    const [formData, setFormData] = useState({
        name: { en: '', te: '', hi: '' },
        role: 'Core',
        position: { en: '', te: '', hi: '' },
        email: '',
        linkedin: '',
        github: '',
        image: '',
        order: 0,
        academicYear: '2025-2026',
        quote: { en: '', te: '', hi: '' }
    });

    const handleAutoTranslate = async (field, value) => {
        if (!value || value.trim().length < 3) return;

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

    const [sessions, setSessions] = useState([]);
    const [currentActiveYear, setCurrentActiveYear] = useState('2025-2026');
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [sessionFormData, setSessionFormData] = useState({
        academicYear: '',
        teamType: 'Governing Body / Execom / Core',
        publishAsCurrent: false,
        description: ''
    });

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await adminFetch('/api/admin/team');
            const data = await res.json();
            if (data.team) {
                setTeam(data.team);
            }
            if (data.sessions) {
                setSessions(data.sessions);
            }
            if (data.currentYear) {
                setCurrentActiveYear(data.currentYear);
                // Also default the selected tab to current active year if not manually changed
                setSelectedAdminYear(prev => prev || data.currentYear);
            }
        } catch (error) {
            console.error('Failed to fetch team', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetCurrentSession = async (yr) => {
        const confirmMsg = `Are you sure you want to set Session ${yr} as the active CURRENT TEAM?
All previous teams will remain completely preserved in the Historical Archive.`;
        if (!confirm(confirmMsg)) return;

        try {
            const res = await adminFetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'set_current_session', academicYear: yr })
            });
            if (res.ok) {
                alert(`Session ${yr} is now the active Current Team!`);
                fetchTeam();
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paths: ['/team', '/team/archive', '/'] }),
                }).catch(() => {});
            } else {
                alert('Failed to set current session.');
            }
        } catch (e) {
            alert('Error setting current session');
        }
    };

    const handleCreateSessionSubmit = async (e) => {
        e.preventDefault();
        if (!sessionFormData.academicYear) {
            alert('Please enter an academic year (e.g. 2026-2027)');
            return;
        }

        setSaving(true);
        try {
            const res = await adminFetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_session',
                    academicYear: sessionFormData.academicYear.trim(),
                    teamType: sessionFormData.teamType,
                    publishAsCurrent: sessionFormData.publishAsCurrent,
                    description: sessionFormData.description
                })
            });

            if (res.ok) {
                alert(`Session ${sessionFormData.academicYear} created successfully!`);
                setIsSessionModalOpen(false);
                setSelectedAdminYear(sessionFormData.academicYear.trim());
                setSessionFormData({
                    academicYear: '',
                    teamType: 'Governing Body / Execom / Core',
                    publishAsCurrent: false,
                    description: ''
                });
                fetchTeam();
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paths: ['/team', '/team/archive', '/'] }),
                }).catch(() => {});
            } else {
                const err = await res.json();
                alert(`Failed: ${err.error || 'Could not create session'}`);
            }
        } catch (err) {
            alert('Error creating session');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Strict validation
        const val = validateImageFile(file, { maxSizeBytes: 5 * 1024 * 1024 });
        if (!val.valid) {
            alert(val.error);
            e.target.value = '';
            return;
        }

        setUploading(true);
        try {
            // 2. High-efficiency compression for team member card
            const dataURL = await compressMemberPhoto(file);
            setFormData(prev => ({ ...prev, image: dataURL }));
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };
            if (editingMember) payload.id = editingMember.id;

            const method = editingMember ? 'PUT' : 'POST';
            const res = await adminFetch('/api/admin/team', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // Revalidate the public team page and archive (non-blocking)
                adminFetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paths: ['/team', '/team/archive', '/'] }),
                }).catch(err => console.log('Revalidation error:', err));

                closeModal();
                fetchTeam();
            } else {
                alert('Failed to save team member');
            }
        } catch (error) {
            console.error('Error saving team member', error);
            alert('Error saving team member');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this member?")) return;
        try {
            const res = await adminFetch(`/api/admin/team?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchTeam();
            else alert("Failed to delete");
        } catch (e) {
            alert("Error deleting");
        }
    };

    const openModal = (member = null) => {
        setEditingMember(member);
        setFormData({
            name: typeof member?.name === 'object' ? {
                en: member.name.en || '',
                te: member.name.te || '',
                hi: member.name.hi || ''
            } : { en: member?.name || '', te: '', hi: '' },
            role: member?.role || 'GB',
            position: typeof member?.position === 'object' ? {
                en: member.position.en || '',
                te: member.position.te || '',
                hi: member.position.hi || ''
            } : { en: member?.position || '', te: '', hi: '' },
            email: member?.email || '',
            linkedin: member?.linkedin || '',
            github: member?.github || '',
            image: member?.image || '',
            order: member?.order || 0,
            academicYear: member?.academicYear || selectedAdminYear,
            quote: typeof member?.quote === 'object' ? {
                en: member.quote.en || '',
                te: member.quote.te || '',
                hi: member.quote.hi || ''
            } : { en: member?.quote || '', te: '', hi: '' }
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Team Management</h2>
                    <p className={styles.sectionSubtitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span>Active Website Team:</span>
                        <span style={{
                            padding: '2px 10px',
                            borderRadius: '12px',
                            background: 'rgba(18, 136, 7, 0.25)',
                            color: '#4ade80',
                            fontWeight: '700',
                            fontSize: '12px',
                            border: '1px solid rgba(74, 222, 128, 0.3)'
                        }}>
                            {currentActiveYear} (Current)
                        </span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                        onClick={() => setIsSessionModalOpen(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={16} /> New Academic Session
                    </button>
                    <button
                        type="button"
                        className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                        onClick={() => openModal()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={16} /> Add Member
                    </button>
                </div>
            </div>

            {/* Year Selector with Active / Archive Status */}
            <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '14px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#FF9933', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Session:
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {Array.from(new Set([
                            '2025-2026',
                            ...sessions.map(s => s.academicYear),
                            ...customYears,
                            ...team.map(m => m.academicYear).filter(Boolean)
                        ])).sort((a, b) => b.localeCompare(a)).map((yr) => {
                            const isCurrent = yr === currentActiveYear;
                            const isSelected = selectedAdminYear === yr;

                            return (
                                <button
                                    key={yr}
                                    type="button"
                                    onClick={() => setSelectedAdminYear(yr)}
                                    style={{
                                        padding: '7px 14px',
                                        borderRadius: '16px',
                                        border: '1px solid',
                                        borderColor: isSelected ? '#FF9933' : 'rgba(255,255,255,0.15)',
                                        background: isSelected ? 'rgba(255, 153, 51, 0.2)' : 'rgba(255,255,255,0.03)',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>{yr}</span>
                                    {isCurrent && (
                                        <span style={{ fontSize: '10px', background: '#128807', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>
                                            Active
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Switch Active Session Action */}
                {selectedAdminYear !== currentActiveYear && (
                    <button
                        type="button"
                        onClick={() => handleSetCurrentSession(selectedAdminYear)}
                        className="marvelous-btn marvelous-btn-sm"
                        style={{
                            background: 'linear-gradient(135deg, #128807, #0d6305)',
                            color: '#fff',
                            border: 'none',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <ShieldCheck size={14} />
                        <span>Publish {selectedAdminYear} as Current Team</span>
                    </button>
                )}
            </div>

            <div className={styles.card}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Image</th>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Category</th>
                                <th className={styles.th}>Position</th>
                                <th className={styles.th}>Year</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.filter(m => (m.academicYear || '2025-2026') === selectedAdminYear).length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={styles.emptyState}>No team members found for {selectedAdminYear}</td>
                                </tr>
                            ) : (
                                team.filter(m => (m.academicYear || '2025-2026') === selectedAdminYear).map((member) => (
                                    <tr key={member.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#eee' }}>
                                                {member.image ? (
                                                    <img src={member.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px' }}>{(typeof member.name === 'object' ? (member.name.en || '') : member.name).charAt(0)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.td}>{typeof member.name === 'object' ? member.name.en : member.name}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${styles.badgeInfo}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{typeof member.position === 'object' ? member.position.en : (member.position || '-')}</td>
                                        <td className={styles.td}>{member.academicYear || '2025-2026'}</td>
                                        <td className={styles.td}>
                                            <button
                                                className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                                                style={{ marginRight: '8px' }}
                                                onClick={() => openModal(member)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                                                style={{ backgroundColor: '#ff4d4f', color: 'white', borderColor: 'transparent' }}
                                                onClick={() => handleDelete(member.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {translating && <div style={{ padding: '8px 20px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}>Auto-translating to Hindi & Telugu...</div>}
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Name (English) *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            required
                                            value={formData.name.en}
                                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('name', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Name (Telugu)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.name.te}
                                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Name (Hindi)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.name.hi}
                                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, hi: e.target.value } })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Group / Category *</label>
                                        <select
                                            className={styles.input}
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            required
                                            style={{ appearance: 'auto' }}
                                        >
                                            <option value="GB">Governing Body (GB)</option>
                                            <option value="Execom">Executive Committee (Execom)</option>
                                            <option value="Core">Core Members</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Academic Year *</label>
                                        <select
                                            className={styles.input}
                                            value={formData.academicYear}
                                            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                            required
                                            style={{ appearance: 'auto' }}
                                        >
                                            {Array.from(new Set([
                                                ...customYears,
                                                ...team.map(m => m.academicYear).filter(Boolean)
                                            ])).sort((a, b) => b.localeCompare(a)).map((yr) => (
                                                <option key={yr} value={yr}>{yr}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Position (English)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g. Activity Lead"
                                            value={formData.position.en}
                                            onChange={(e) => setFormData({ ...formData, position: { ...formData.position, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('position', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Position (Telugu)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.position.te}
                                            onChange={(e) => setFormData({ ...formData, position: { ...formData.position, te: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Position (Hindi)</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.position.hi}
                                            onChange={(e) => setFormData({ ...formData, position: { ...formData.position, hi: e.target.value } })}
                                        />
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Quote (English - Will Auto-Translate)</label>
                                        <textarea
                                            className={styles.input}
                                            placeholder="Member's custom quote/phrase..."
                                            value={formData.quote?.en || ''}
                                            onChange={(e) => setFormData({ ...formData, quote: { ...formData.quote, en: e.target.value } })}
                                            onBlur={(e) => handleAutoTranslate('quote', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Quote (Telugu)</label>
                                        <textarea
                                            className={styles.input}
                                            value={formData.quote?.te || ''}
                                            onChange={(e) => setFormData({ ...formData, quote: { ...formData.quote, te: e.target.value } })}
                                            rows={2}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Quote (Hindi)</label>
                                        <textarea
                                            className={styles.input}
                                            value={formData.quote?.hi || ''}
                                            onChange={(e) => setFormData({ ...formData, quote: { ...formData.quote, hi: e.target.value } })}
                                            rows={2}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>LinkedIn URL</label>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            placeholder="https://linkedin.com/in/username"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>GitHub URL</label>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            placeholder="https://github.com/username"
                                            value={formData.github}
                                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Order</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className={styles.input}
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        {uploading && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Processing image...</div>}
                                        {formData.image && (
                                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#aaa' }}>Image uploaded</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving || uploading}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create New Academic Session Modal */}
            {isSessionModalOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsSessionModalOpen(false); }}>
                    <div className={styles.modalContent} style={{ maxWidth: '520px' }}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Create Academic Session</h3>
                            <button className={styles.closeBtn} onClick={() => setIsSessionModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateSessionSubmit}>
                            <div className={styles.modalBody}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Academic Year *</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g. 2026-2027"
                                            required
                                            value={sessionFormData.academicYear}
                                            onChange={(e) => setSessionFormData({ ...sessionFormData, academicYear: e.target.value })}
                                        />
                                        <small style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>
                                            Format: YYYY-YYYY (e.g. 2026-2027)
                                        </small>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Team Structure</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={sessionFormData.teamType}
                                            onChange={(e) => setSessionFormData({ ...sessionFormData, teamType: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Session Description / Theme</label>
                                        <textarea
                                            className={styles.input}
                                            placeholder="Brief notes or theme for this academic session"
                                            rows={2}
                                            value={sessionFormData.description}
                                            onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
                                        />
                                    </div>

                                    <div style={{
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'rgba(255, 153, 51, 0.08)',
                                        border: '1px solid rgba(255, 153, 51, 0.25)',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start'
                                    }}>
                                        <input
                                            type="checkbox"
                                            id="publishAsCurrent"
                                            style={{ marginTop: '3px', cursor: 'pointer' }}
                                            checked={sessionFormData.publishAsCurrent}
                                            onChange={(e) => setSessionFormData({ ...sessionFormData, publishAsCurrent: e.target.checked })}
                                        />
                                        <label htmlFor="publishAsCurrent" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer', lineHeight: '1.4' }}>
                                            <strong>Publish as active Current Team immediately</strong>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                                Previous active team will be moved to the Historical Archive. Existing team members and photographs remain 100% safe.
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setIsSessionModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                                    {saving ? 'Creating...' : 'Create Academic Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
