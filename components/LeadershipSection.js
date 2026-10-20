'use client';

import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './LeadershipSection.module.css';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote, Sparkles, Building2 } from 'lucide-react';
import { fetchWithCache } from '@/utils/client-cache';

export default function LeadershipSection() {
    const { language } = useLanguage();
    const [officerData, setOfficerData] = useState(null);
    const [chairmanData, setChairmanData] = useState(null);

    useEffect(() => {
        // Fetch Program Officer
        fetchWithCache('/api/program-officer')
            .then(json => {
                if (json?.officer) setOfficerData(json.officer);
            })
            .catch(console.error);

        // Fetch Chairman
        fetchWithCache('/api/chairman')
            .then(json => {
                if (json?.chairman) setChairmanData(json.chairman);
            })
            .catch(console.error);
    }, []);

    // 1. Chairman first, 2. Programme Officer second
    const leaders = [
        {
            data: chairmanData,
            roleTag: 'CHAIRMAN',
            roleTitle: 'Chairman, NSS MJCET',
            designationFallback: 'Professor & Principal',
            college: 'Muffakham Jah College of Engineering & Technology',
            accent: 'gold',
            quoteFallback: 'EDUCATION IS THE ARCHITECTURE OF THE SOUL'
        },
        {
            data: officerData,
            roleTag: 'PROGRAMME OFFICER',
            roleTitle: 'NSS Programme Officer',
            designationFallback: 'NSS Programme Officer',
            college: 'Muffakham Jah College of Engineering & Technology',
            accent: 'green',
            quoteFallback: 'Service to society is service to humanity. Every volunteer carries the power to ignite meaningful change and transform communities with compassion and dedication.'
        }
    ];

    return (
        <section className={styles.leadershipSection} id="leadership">
            <div className="container">
                {/* Section Header */}
                <div className={styles.sectionHeader}>
                    <motion.div
                        className={styles.headerBadge}
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Sparkles size={13} />
                        <span>Executive Guidance</span>
                    </motion.div>
                    <motion.h2
                        className={styles.sectionHeading}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Leadership &amp; Patrons
                    </motion.h2>
                    <motion.p
                        className={styles.sectionSubtext}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        Under the esteemed leadership and relentless mentorship of our college administration
                    </motion.p>
                </div>

                {/* Team-cards style 2-column grid */}
                <div className={styles.leadersGrid}>
                    {leaders.map((item, idx) => (
                        <LeaderTeamCard
                            key={idx}
                            item={item}
                            language={language}
                            index={idx}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function LeaderTeamCard({ item, language, index }) {
    const { data, roleTag, designationFallback, college, accent, quoteFallback } = item;

    const name = data ? getText(data.name, language) : (accent === 'gold' ? 'Dr. SURAMPUDI SRINIVASA RAO' : 'NBV Lakshmi Kumari');
    const designation = (data && getText(data.designation, language)) || designationFallback;
    const rawQuote = (data && getText(data.quote || data.message, language)) || quoteFallback;
    const quote = rawQuote.replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '').trim();
    const photo = data?.photo;

    const initials = name
        ? name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'LD';

    return (
        <motion.div
            className={styles.leaderCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover="hover"
        >
            {/* Portrait Image Canvas */}
            <div className={styles.cardImageWrap}>
                {photo ? (
                    <motion.div
                        className={styles.cardImgInner}
                        variants={{ hover: { scale: 1.05 } }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Image
                            src={photo}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className={styles.cardPhoto}
                            priority
                            unoptimized={typeof photo === 'string' && photo.startsWith('data:')}
                        />
                    </motion.div>
                ) : (
                    <div className={styles.cardPlaceholder}>
                        <span>{initials}</span>
                    </div>
                )}

                {/* Subtle base gradient so text at bottom is always legible */}
                <div className={styles.cardBaseGradient} />

                {/* Top Role Badge */}
                <div className={`${styles.roleBadge} ${accent === 'green' ? styles.badgeGreen : styles.badgeGold}`}>
                    <span className={styles.roleDot} />
                    <span>{roleTag}</span>
                </div>

                {/* Default Bottom Info Bar (Team-card style) */}
                <div className={styles.bottomInfoBar}>
                    <div className={styles.infoTextGroup}>
                        <h3 className={styles.leaderName}>{name}</h3>
                        <p className={styles.leaderDesignation}>{designation}</p>
                        <p className={styles.leaderCollege}>{college}</p>
                    </div>
                </div>

                {/* Hover Quote Overlay — Slides up and reveals quote on cursor hover */}
                <div className={styles.quoteOverlay}>
                    <div className={styles.quoteIconCircle}>
                        <Quote size={28} className={styles.quoteIcon} />
                    </div>
                    <blockquote className={styles.quoteMessage}>
                        &ldquo;{quote}&rdquo;
                    </blockquote>
                    <div className={styles.quoteDivider} />
                    <div className={styles.quoteAuthor}>
                        <strong>{name}</strong>
                        <span>{roleTag}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
