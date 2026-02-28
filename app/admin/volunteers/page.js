'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';

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
            const res = await fetch('/api/admin/volunteers');
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
            const res = await fetch('/api/admin/volunteers', {
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
            const res = await fetch(`/api/admin/volunteers?id=${id}`, {
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

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h2 className={styles.sectionTitle}>Volunteer Registrations</h2>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    View and manage student volunteer applications.
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Roll Number</th>
                                <th className={styles.th}>Department</th>
                                <th className={styles.th}>Year</th>
                                <th className={styles.th}>Phone</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {volunteers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyState}>No registrations found</td>
                                </tr>
                            ) : (
                                volunteers.map((volunteer) => (
                                    <tr key={volunteer.id} className={styles.tr}>
                                        <td className={styles.td}>{volunteer.name}</td>
                                        <td className={styles.td}>{volunteer.rollNumber}</td>
                                        <td className={styles.td}>{volunteer.department}</td>
                                        <td className={styles.td}>{volunteer.year}</td>
                                        <td className={styles.td}>{volunteer.phone}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${getStatusBadgeClass(volunteer.status)}`}>
                                                {volunteer.status}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.btnGroup}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                                                    onClick={() => setSelectedVolunteer(volunteer)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                                                    onClick={() => handleDelete(volunteer.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedVolunteer && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Volunteer Details</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Name</label>
                                    <div className={styles.input}>{selectedVolunteer.name}</div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email</label>
                                    <div className={styles.input}>{selectedVolunteer.email}</div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phone</label>
                                    <div className={styles.input}>{selectedVolunteer.phone}</div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Roll Number</label>
                                    <div className={styles.input}>{selectedVolunteer.rollNumber}</div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Department</label>
                                    <div className={styles.input}>{selectedVolunteer.department}</div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Year</label>
                                    <div className={styles.input}>{selectedVolunteer.year}</div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Interests</label>
                                    <div className={styles.input}>
                                        {selectedVolunteer.interests && selectedVolunteer.interests.length > 0
                                            ? selectedVolunteer.interests.join(', ')
                                            : 'None listed'}
                                    </div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Message</label>
                                    <div className={styles.textarea}>
                                        {selectedVolunteer.message || 'No message provided'}
                                    </div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Update Status</label>
                                    <div className={styles.btnGroup} style={{ marginTop: '0.5rem' }}>
                                        <button
                                            className={`${styles.btn} ${styles.btnSm} ${selectedVolunteer.status === 'pending' ? styles.btnPrimary : styles.btnSecondary}`}
                                            onClick={() => updateStatus(selectedVolunteer.id, 'pending')}
                                        >
                                            Pending
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnSm} ${selectedVolunteer.status === 'approved' ? styles.badgeSuccess : styles.btnSecondary}`}
                                            onClick={() => updateStatus(selectedVolunteer.id, 'approved')}
                                            style={selectedVolunteer.status === 'approved' ? { color: 'white', backgroundColor: 'var(--color-success)' } : {}}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnSm} ${selectedVolunteer.status === 'rejected' ? styles.badgeError : styles.btnSecondary}`}
                                            onClick={() => updateStatus(selectedVolunteer.id, 'rejected')}
                                            style={selectedVolunteer.status === 'rejected' ? { color: 'white', backgroundColor: 'var(--color-error)' } : {}}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
