'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage, getText, formatDate } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { formatDate as robustFormatDate } from '@/utils/formatters';
import styles from './AnnouncementsSection.module.css';
const dreamyReveal = {
    initial: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

export default function AnnouncementsSection() {
    const { language } = useLanguage();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/announcements', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.announcements) {
                    setAnnouncements(data.announcements.slice(0, 3)); // Show top 3
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch announcements:', err);
                setLoading(false);
            });
    }, []);

    const t = {
        en: {
            title: 'LATEST ANNOUNCEMENTS',
            viewAll: 'View All Announcements',
            empty: 'No news yet. Check back later!'
        },
        te: {
            title: 'తాజా ప్రకటనలు',
            viewAll: 'అన్ని ప్రకటనలను చూడండి',
            empty: 'ఇంకా వార్తలు లేవు. తర్వాత మళ్ళీ రండి!'
        },
        hi: {
            title: 'नवीनतम घोषणाएं',
            viewAll: 'सभी घोषणाएं देखें',
            empty: 'अभी तक कोई खबर नहीं है। बाद में फिर देखें!'
        }
    };

    if (loading) return null;

    return (
        <section className={styles.announcementSection}>
            <div className="container">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        animate: { transition: { staggerChildren: 0.1 } }
                    }}
                >
                    <div className={styles.header}>
                        <motion.h2
                            className={styles.title}
                            variants={dreamyReveal}
                        >
                            {t[language].title}
                        </motion.h2>
                        {announcements.length > 0 && (
                            <motion.div variants={dreamyReveal}>
                                <Link href="/announcements" className={styles.viewAllBtn}>
                                    {t[language].viewAll}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    {announcements.length === 0 ? (
                        <motion.div
                            variants={dreamyReveal}
                            style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', color: 'rgba(255,255,255,0.5)' }}
                        >
                            {t[language].empty}
                        </motion.div>
                    ) : (
                        <div className={styles.grid}>
                            {announcements.map((announcement, index) => (
                                <motion.div
                                    key={announcement._id}
                                    className={styles.card}
                                    variants={dreamyReveal}
                                >
                                    <div className={styles.cardHeader}>
                                        <span className={`${styles.priority} ${styles[announcement.priority]}`}>
                                            {announcement.priority}
                                        </span>
                                        <span className={styles.date}>
                                            {robustFormatDate(announcement.createdAt)}
                                        </span>
                                    </div>
                                    <h3 className={styles.cardTitle}>{getText(announcement.title, language)}</h3>
                                    <p className={styles.cardContent}>
                                        {getText(announcement.content, language).length > 100
                                            ? `${getText(announcement.content, language).substring(0, 100)}...`
                                            : getText(announcement.content, language)}
                                    </p>
                                    <Link href="/announcements" className={styles.readMore}>
                                        Read More
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
