'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { getRelativeTime } from '@/utils/formatters';
import styles from './announcements.module.css';
import { motion } from 'framer-motion';

const translations = {
    en: {
        title: 'Announcements',
        subtitle: 'Latest Updates and Notices',
        noAnnouncements: 'No announcements at this time',
    },
    te: {
        title: 'ప్రకటనలు',
        subtitle: 'తాజా నవీకరణలు మరియు నోటీసులు',
        noAnnouncements: 'ఈ సమయంలో ప్రకటనలు లేవు',
    },
    hi: {
        title: 'घोषणाएँ',
        subtitle: 'नवीनतम अपडेट और सूचनाएं',
        noAnnouncements: 'इस समय कोई घोषणा नहीं है',
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

                            return (
                                <div
                                    key={announcement.id || announcement._id}
                                    className={styles.announcementBox}
                                    style={{ borderLeft: `4px solid ${cat.color}` }}
                                >
                                    <div className={styles.announcementHeader}>
                                        <h3>{announcement.title?.[language] || announcement.title?.en || 'Untitled'}</h3>
                                        <div className={styles.badges}>
                                            <span
                                                className={styles.priorityBadge}
                                                style={{
                                                    backgroundColor: cat.bg,
                                                    color: cat.color,
                                                    borderColor: `${cat.color}44`,
                                                    fontWeight: '700',
                                                    letterSpacing: '0.5px'
                                                }}
                                            >
                                                {cat.label}
                                            </span>
                                            <span className={styles.timeBadge}>
                                                {getRelativeTime(announcement.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    {announcement.imageUrl && (
                                        <div className={styles.announcementImage}>
                                            <img src={announcement.imageUrl} alt={announcement.title?.[language] || announcement.title?.en} />
                                        </div>
                                    )}
                                    <div
                                        className={styles.announcementContent}
                                        dangerouslySetInnerHTML={{
                                            __html: ((announcement.content?.[language] || announcement.content?.en) || '').replace(/\n/g, '<br />')
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
