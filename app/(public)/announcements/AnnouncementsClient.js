'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getRelativeTime, formatDate } from '@/utils/formatters';
import styles from './announcements.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ArrowRight, Calendar, Tag, Maximize2 } from 'lucide-react';

const translations = {
    en: {
        title: 'Announcements',
        subtitle: 'Latest Updates and Notices',
        noAnnouncements: 'No announcements at this time',
        readMore: 'View full announcement',
        close: 'Close',
        openLink: 'Open Attached Link',
    },
    te: {
        title: 'ప్రకటనలు',
        subtitle: 'తాజా నవీకరణలు మరియు నోటీసులు',
        noAnnouncements: 'ఈ సమయంలో ప్రకటనలు లేవు',
        readMore: 'పూర్తి వివరాలు చూడండి',
        close: 'మూసివేయి',
        openLink: 'లింక్ తెరవండి',
    },
    hi: {
        title: 'घोषणाएँ',
        subtitle: 'नवीनतम अपडेट और सूचनाएं',
        noAnnouncements: 'इस समय कोई घोषणा नहीं है',
        readMore: 'पूरी घोषणा देखें',
        close: 'बंद करें',
        openLink: 'संलग्न लिंक खोलें',
    },
};

const categoryConfig = {
    completed: { label: 'COMPLETED EVENT', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)' },
    upcoming: { label: 'UPCOMING EVENT', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    notice: { label: 'IMPORTANT NOTICE', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    urgent: { label: 'IMPORTANT NOTICE', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
    high: { label: 'IMPORTANT NOTICE', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
    general: { label: 'ANNOUNCEMENT', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
    medium: { label: 'ANNOUNCEMENT', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
    low: { label: 'ANNOUNCEMENT', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
};

export default function AnnouncementsClient({ initialAnnouncements = [] }) {
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedAnnouncement(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Lock body scroll when modal is active
    useEffect(() => {
        if (selectedAnnouncement) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedAnnouncement]);

    return (
        <div className={styles.announcementsPage}>
            <section className={styles.hero}>
                <div className="container">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {t.title}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                        {t.subtitle}
                    </motion.p>
                </div>
            </section>

            <div className="container">
                {initialAnnouncements.length === 0 ? (
                    <div className={styles.noAnnouncements}>
                        <p>{t.noAnnouncements}</p>
                    </div>
                ) : (
                    <div className={styles.announcementsList}>
                        {initialAnnouncements.map((announcement) => {
                            const catKey = announcement.category || announcement.priority || 'completed';
                            const cat = categoryConfig[catKey] || categoryConfig.completed;
                            const title = announcement.title?.[language] || announcement.title?.en || 'Untitled Announcement';
                            const rawContent = (announcement.content?.[language] || announcement.content?.en) || '';

                            return (
                                <motion.div
                                    key={announcement.id || announcement._id}
                                    className={styles.announcementBox}
                                    onClick={() => setSelectedAnnouncement(announcement)}
                                    role="button"
                                    tabIndex={0}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {announcement.imageUrl && (
                                        <div className={styles.announcementImage}>
                                            <img src={announcement.imageUrl} alt={title} />
                                        </div>
                                    )}
                                    <div className={styles.cardBody}>
                                        <div className={styles.announcementHeader}>
                                            <h3>{title}</h3>
                                            <div className={styles.badges}>
                                                <span
                                                    className={styles.priorityBadge}
                                                    style={{
                                                        backgroundColor: cat.bg,
                                                        color: cat.color,
                                                        borderColor: `${cat.color}44`,
                                                    }}
                                                >
                                                    {cat.label}
                                                </span>
                                                <span className={styles.timeBadge}>
                                                    {getRelativeTime(announcement.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={styles.announcementContent}
                                            dangerouslySetInnerHTML={{
                                                __html: rawContent.replace(/\n/g, '<br />')
                                            }}
                                        />
                                        <div className={styles.readMorePrompt}>
                                            <span>{t.readMore}</span>
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FULL DETAIL MODAL */}
            <AnimatePresence>
                {selectedAnnouncement && (
                    <motion.div
                        className={styles.modalBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAnnouncement(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className={styles.modalCloseBtn}
                                onClick={() => setSelectedAnnouncement(null)}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                            {selectedAnnouncement.imageUrl && (
                                <div className={styles.modalImageWrap}>
                                    <img
                                        src={selectedAnnouncement.imageUrl}
                                        alt={selectedAnnouncement.title?.[language] || selectedAnnouncement.title?.en || ''}
                                        className={styles.modalImage}
                                        onClick={() => window.open(selectedAnnouncement.imageUrl, '_blank')}
                                        title="Click to open full image"
                                    />
                                    <a
                                        href={selectedAnnouncement.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.modalImageZoomBtn}
                                        title="Open full image in new tab"
                                    >
                                        <Maximize2 size={12} />
                                        <span>Full Image</span>
                                    </a>
                                </div>
                            )}

                            <div className={styles.modalBody}>
                                <div className={styles.modalMetaRow}>
                                    {(() => {
                                        const catKey = selectedAnnouncement.category || selectedAnnouncement.priority || 'completed';
                                        const cat = categoryConfig[catKey] || categoryConfig.completed;
                                        return (
                                            <span
                                                className={styles.modalCategoryBadge}
                                                style={{
                                                    backgroundColor: cat.bg,
                                                    color: cat.color,
                                                    border: `1px solid ${cat.color}44`,
                                                }}
                                            >
                                                {cat.label}
                                            </span>
                                        );
                                    })()}
                                    <span className={styles.modalDateBadge}>
                                        <Calendar size={13} style={{ marginRight: '5px' }} />
                                        {formatDate(selectedAnnouncement.createdAt)}
                                    </span>
                                </div>

                                <h2 className={styles.modalTitle}>
                                    {selectedAnnouncement.title?.[language] || selectedAnnouncement.title?.en || 'Untitled'}
                                </h2>

                                <div className={styles.modalDivider} />

                                <div
                                    className={styles.modalFullContent}
                                    dangerouslySetInnerHTML={{
                                        __html: ((selectedAnnouncement.content?.[language] || selectedAnnouncement.content?.en) || '').replace(/\n/g, '<br />')
                                    }}
                                />

                                {(selectedAnnouncement.linkUrl || selectedAnnouncement.btnLink) && (
                                    <div className={styles.modalActions}>
                                        <a
                                            href={selectedAnnouncement.linkUrl || selectedAnnouncement.btnLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="marvelous-btn marvelous-btn-primary"
                                        >
                                            <ExternalLink size={16} style={{ marginRight: '6px' }} />
                                            {selectedAnnouncement.btnText?.[language] || selectedAnnouncement.btnText?.en || t.openLink}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
