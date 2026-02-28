'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../admin-content.module.css';

export default function ContactPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/contact');
            const data = await res.json();
            if (data.contacts) {
                setMessages(data.contacts);
            }
        } catch (error) {
            console.error('Failed to fetch contact submissions', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch('/api/admin/contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                // Optimistic update
                setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
                if (selectedMessage && selectedMessage.id === id) {
                    setSelectedMessage({ ...selectedMessage, status: newStatus });
                }
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            const res = await fetch(`/api/admin/contact?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setMessages(messages.filter(m => m.id !== id));
                if (selectedMessage) closeModal();
            } else {
                alert('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message', error);
        }
    };

    const closeModal = () => {
        setSelectedMessage(null);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'responded': return styles.badgeSuccess;
            case 'new': return styles.badgeWarning;
            default: return styles.badgeInfo;
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h2 className={styles.sectionTitle}>Contact Submissions</h2>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    View messages from the contact form.
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Date</th>
                                <th className={styles.th}>Name</th>
                                <th className={styles.th}>Email</th>
                                <th className={styles.th}>Subject</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={styles.emptyState}>No messages found</td>
                                </tr>
                            ) : (
                                messages.map((msg) => (
                                    <tr key={msg.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            {msg.submittedAt ? new Date(msg.submittedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className={styles.td}>{msg.name}</td>
                                        <td className={styles.td}>{msg.email}</td>
                                        <td className={styles.td}>{msg.subject}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${getStatusBadgeClass(msg.status)}`}>
                                                {msg.status}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.btnGroup}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                                                    onClick={() => setSelectedMessage(msg)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                                                    onClick={() => handleDelete(msg.id)}
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

            {selectedMessage && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Message Details</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>From</label>
                                    <div className={styles.input} style={{ background: 'var(--color-gray-50)' }}>
                                        {selectedMessage.name} ({selectedMessage.email})
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Date</label>
                                    <div className={styles.input} style={{ background: 'var(--color-gray-50)' }}>
                                        {selectedMessage.submittedAt ? new Date(selectedMessage.submittedAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Subject</label>
                                    <div className={styles.input} style={{ background: 'var(--color-gray-50)' }}>
                                        {selectedMessage.subject}
                                    </div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Message</label>
                                    <div className={styles.textarea} style={{ background: 'var(--color-gray-50)', whiteSpace: 'pre-wrap' }}>
                                        {selectedMessage.message}
                                    </div>
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Update Status</label>
                                    <div className={styles.btnGroup} style={{ marginTop: '0.5rem' }}>
                                        <button
                                            className={`${styles.btn} ${styles.btnSm} ${selectedMessage.status === 'new' ? styles.badgeWarning : styles.btnSecondary}`}
                                            onClick={() => updateStatus(selectedMessage.id, 'new')}
                                            style={selectedMessage.status === 'new' ? { color: 'white', backgroundColor: 'var(--color-warning)' } : {}}
                                        >
                                            New
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnSm} ${selectedMessage.status === 'read' ? styles.badgeInfo : styles.btnSecondary}`}
                                            onClick={() => updateStatus(selectedMessage.id, 'read')}
                                            style={selectedMessage.status === 'read' ? { color: 'white', backgroundColor: 'var(--color-info)' } : {}}
                                        >
                                            Read
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnSm} ${selectedMessage.status === 'responded' ? styles.badgeSuccess : styles.btnSecondary}`}
                                            onClick={() => updateStatus(selectedMessage.id, 'responded')}
                                            style={selectedMessage.status === 'responded' ? { color: 'white', backgroundColor: 'var(--color-success)' } : {}}
                                        >
                                            Responded
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
