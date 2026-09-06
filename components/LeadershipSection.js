'use client';

import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './LeadershipSection.module.css';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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

    // 1. Chairman first, 2. Programme Officer second (stacked up and down)
    const leaders = [
        {
            data: chairmanData,
            roleTag: 'CHAIRMAN',
            roleTitle: 'Chairman, NSS MJCET',
            designationFallback: 'Principal & Head of Institution',
            college: 'Muffakham Jah College of Engineering & Technology',
            accent: 'saffron',
            quoteFallback: 'Empowering youth through community service is at the very core of institutional education. NSS MJCET instills the lifelong values of leadership, empathy, and selfless nation-building.'
        },
        {
            data: officerData,
            roleTag: 'PROGRAMME OFFICER',
            roleTitle: 'NSS Programme Officer',
            designationFallback: 'NSS Programme Officer & Faculty, Mechanical Engg.',
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
                        Leadership & Patrons
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

                {/* Stacked Executive Cards (Up & Down: Chairman first, then Programme Officer) */}
                <div className={styles.leadersStack}>
                    {leaders.map((item, idx) => (
                        <ExecutiveCard
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

function ExecutiveCard({ item, language, index }) {
    const { data, roleTag, designationFallback, college, accent, quoteFallback } = item;

    const name = data ? getText(data.name, language) : (accent === 'saffron' ? 'Dr. Basheer Ahmed' : 'Dr. Mohammed Naseeruddin');
    const designation = (data && getText(data.designation, language)) || designationFallback;
    const quote = (data && getText(data.quote || data.message, language)) || quoteFallback;
    const photo = data?.photo;

    return (
        <motion.div
            className={`${styles.executiveCard} ${accent === 'green' ? styles.cardGreen : styles.cardSaffron}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
        >
            {/* Top Subtle Accent Bar */}
            <div className={styles.cardTopAccent} />

            <div className={styles.cardLayout}>
                {/* Left Portrait Column — CSI MJCET style */}
                <div className={styles.portraitCol}>
                    <div className={styles.portraitFrame}>
                        {photo ? (
                            <img
                                src={photo}
                                alt={name}
                                className={styles.portraitImg}
                            />
                        ) : (
                            <div className={styles.portraitPlaceholder}>
                                <span>{name?.charAt(0)}</span>
                            </div>
                        )}
                        <div className={styles.portraitGlow} />
                    </div>
                </div>

                {/* Right Details Column — CSI MJCET style */}
                <div className={styles.detailsCol}>
                    {/* Role Header Badge */}
                    <div className={styles.roleTag}>
                        <span className={styles.roleDot} />
                        <span>{roleTag}</span>
                    </div>

                    {/* Executive Full Name */}
                    <h3 className={styles.executiveName}>{name}</h3>

                    {/* Designation & Institution Box */}
                    <div className={styles.designationBox}>
                        <Building2 className={styles.boxIcon} size={18} />
                        <div className={styles.boxTextGroup}>
                            <span className={styles.boxPrimaryText}>{designation}</span>
                            <span className={styles.boxSecondaryText}>{college}</span>
                        </div>
                    </div>

                    {/* Quotation / Message Block */}
                    <div className={styles.quoteBlock}>
                        <Quote className={styles.quoteIcon} size={20} />
                        <p className={styles.quoteText}>{quote}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
