'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';
import { adminFetch } from '@/utils/api-client';

export default function VolunteersPage() {
    const { user } = useAuth();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        try {
            const res = await adminFetch('/api/admin/volunteers');
            const data = await res.json();
            if (data.volunteers) {
                setVolunteers(data.volunteers);
            }
        } catch (error) {
            console.error('Failed to fetch volunteers', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await adminFetch('/api/admin/volunteers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                // Optimistic update
                setVolunteers(volunteers.map(v => v.id === id ? { ...v, status: newStatus } : v));
                if (selectedVolunteer && selectedVolunteer.id === id) {
                    setSelectedVolunteer({ ...selectedVolunteer, status: newStatus });
                }
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this volunteer registration?')) return;
        try {
            const res = await adminFetch(`/api/admin/volunteers?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setVolunteers(volunteers.filter(v => v.id !== id));
                if (selectedVolunteer) closeModal();
            } else {
                alert('Failed to delete volunteer');
            }
        } catch (error) {
            console.error('Error deleting volunteer', error);
        }
    };

    const closeModal = () => {
        setSelectedVolunteer(null);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved': return styles.badgeSuccess;
            case 'rejected': return styles.badgeError;
            default: return styles.badgeWarning;
        }
    };

    if (loading) return (
        <div className={styles.loading}>
            <div className="spinner"></div>
            <p>Scanning applicant records...</p>
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Volunteer Registrations</h2>
                    <p className={styles.sectionSubtitle}>Review and process student applications for the NSS program</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', fontWeight: 'bold' }}>
                    {volunteers.length} Total Applicants
                </div>
            </div>

            {volunteers.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--marvel-text-dim)' }}>
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No registrations found.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {volunteers.map((volunteer) => (
                        <div key={volunteer.id} className={styles.gridItem}>
                            <div className={styles.gridContent}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span className={`${styles.badge} ${getStatusBadgeClass(volunteer.status)}`}>
                                        {volunteer.status}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>#{volunteer.rollNumber}</span>
                                </div>
                                
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>{volunteer.name}</h3>
                                
                                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--marvel-text-dim)' }}>Department</span>
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{volunteer.department}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--marvel-text-dim)' }}>Academic Year</span>
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{volunteer.year}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--marvel-text-dim)' }}>Contact</span>
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{volunteer.phone}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.gridActions}>
                                <button
                                    className="marvelous-btn marvelous-btn-primary marvelous-btn-sm"
                                    onClick={() => setSelectedVolunteer(volunteer)}
                                    style={{ flex: 1 }}
                                >
                                    Review Application
                                </button>
                                <button
                                    className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                                    onClick={() => handleDelete(volunteer.id)}
                                    style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedVolunteer && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>Application Analysis</h3>
                                <p style={{ fontSize: '12px', color: 'var(--marvel-text-dim)' }}>ID: {selectedVolunteer.id}</p>
                            </div>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{selectedVolunteer.name}</div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email Reference</label>
                                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{selectedVolunteer.email}</div>
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                                <label className={styles.label}>Areas of Interest</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {selectedVolunteer.interests && selectedVolunteer.interests.length > 0 ? (
                                        selectedVolunteer.interests.map(interest => (
                                            <span key={interest} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                                {interest}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: 'var(--marvel-text-dim)', fontSize: '13px' }}>None specified</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Statement of Purpose</label>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', minHeight: '100px' }}>
                                    {selectedVolunteer.message || 'The applicant did not provide a message.'}
                                </div>
                            </div>

                            <div style={{ marginTop: '40px' }}>
                                <label className={styles.label}>Decision Protocol</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '12px' }}>
                                    <button
                                        className={`marvelous-btn marvelous-btn-sm ${selectedVolunteer.status === 'pending' ? 'marvelous-btn-primary' : 'marvelous-btn-outline'}`}
                                        onClick={() => updateStatus(selectedVolunteer.id, 'pending')}
                                    >
                                        Set Pending
                                    </button>
                                    <button
                                        className="marvelous-btn marvelous-btn-sm"
                                        onClick={() => updateStatus(selectedVolunteer.id, 'approved')}
                                        style={{ background: selectedVolunteer.status === 'approved' ? 'var(--color-success)' : 'rgba(34, 197, 94, 0.1)', color: selectedVolunteer.status === 'approved' ? 'white' : '#22c55e', borderColor: '#22c55e' }}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="marvelous-btn marvelous-btn-sm"
                                        onClick={() => updateStatus(selectedVolunteer.id, 'rejected')}
                                        style={{ background: selectedVolunteer.status === 'rejected' ? 'var(--color-error)' : 'rgba(239, 68, 68, 0.1)', color: selectedVolunteer.status === 'rejected' ? 'white' : '#ef4444', borderColor: '#ef4444' }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Trash({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
}
