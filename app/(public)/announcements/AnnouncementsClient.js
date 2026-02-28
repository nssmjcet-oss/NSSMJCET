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
        urgent: 'Urgent',
        high: 'High Priority',
        medium: 'Medium',
        low: 'Low',
    },
    te: {
        title: 'ప్రకటనలు',
        subtitle: 'తాజా నవీకరణలు మరియు నోటీసులు',
        noAnnouncements: 'ఈ సమయంలో ప్రకటనలు లేవు',
        urgent: 'అత్యవసరం',
        high: 'అధిక ప్రాధాన్యత',
        medium: 'మధ్యస్థ',
        low: 'తక్కువ',
    },
    hi: {
        title: 'घोषणाएँ',
        subtitle: 'नवीनतम अपडेट और सूचनाएं',
        noAnnouncements: 'इस समय कोई घोषणा नहीं है',
        urgent: 'तत्काल',
        high: 'उच्च प्राथमिकता',
        medium: 'मध्यम',
        low: 'निम्न',
    },
};

const priorityStyles = {
    urgent: {
        color: '#ef4444',
        shadow: '0 0 20px rgba(239, 68, 68, 0.3)'
    },
    high: {
        color: '#f97316',
        shadow: '0 0 20px rgba(249, 115, 22, 0.3)'
    },
    medium: {
        color: '#0ea5e9',
        shadow: '0 0 20px rgba(14, 165, 233, 0.3)'
    },
    low: {
        color: '#94a3b8',
        shadow: '0 0 20px rgba(148, 163, 184, 0.3)'
    },
};

export default function AnnouncementsClient({ announcements }) {
    const { language } = useLanguage();
    const t = translations[language];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className={styles.announcementsPage}>
            <section className={styles.hero}>
                <div className="container">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {t.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {t.subtitle}
                    </motion.p>
                </div>
            </section>

            <div className="container">
                {announcements.length === 0 ? (
                    <motion.div
                        className={styles.noAnnouncements}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p>{t.noAnnouncements}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className={styles.announcementsList}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {announcements.map((announcement) => (
                            <motion.div
                                key={announcement._id}
                                className={styles.announcementCard}
                                variants={itemVariants}
                                style={{
                                    borderLeft: `4px solid ${priorityStyles[announcement.priority].color}`,
                                    boxShadow: announcement.priority === 'urgent' ? priorityStyles.urgent.shadow : 'none'
                                }}
                                whileHover={{
                                    x: 10,
                                    boxShadow: priorityStyles[announcement.priority].shadow
                                }}
                            >
                                <div className={styles.announcementHeader}>
                                    <h3>{announcement.title[language] || announcement.title.en}</h3>
                                    <div className={styles.badges}>
                                        <span
                                            className={styles.priorityBadge}
                                            style={{
                                                backgroundColor: `${priorityStyles[announcement.priority].color}22`,
                                                color: priorityStyles[announcement.priority].color,
                                                borderColor: `${priorityStyles[announcement.priority].color}44`
                                            }}
                                        >
                                            {t[announcement.priority]}
                                        </span>
                                        <span className={styles.timeBadge}>
                                            {getRelativeTime(announcement.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                {announcement.imageUrl && (
                                    <div className={styles.announcementImage}>
                                        <img src={announcement.imageUrl} alt={announcement.title[language] || announcement.title.en} />
                                    </div>
                                )}
                                <div
                                    className={styles.announcementContent}
                                    dangerouslySetInnerHTML={{
                                        __html: (announcement.content[language] || announcement.content.en).replace(/\n/g, '<br />')
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
