'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ClipboardList, Users, HeartHandshake, TrendingUp, ArrowRight } from 'lucide-react';
import styles from './AboutUsSection.module.css';

export default function AboutUsSection({ language = 'en' }) {
    const cycleStages = [
        {
            number: '01',
            title: 'Plan',
            icon: ClipboardList,
            points: [
                'Identify community needs',
                'Define objectives and goals',
                'Plan activities and resources'
            ]
        },
        {
            number: '02',
            title: 'Organise',
            icon: Users,
            points: [
                'Coordinate volunteers & teams',
                'Assign responsibilities',
                'Prepare for execution'
            ]
        },
        {
            number: '03',
            title: 'Engage',
            icon: HeartHandshake,
            points: [
                'Conduct service activities',
                'Outreach & awareness drives',
                'Work with the community'
            ]
        },
        {
            number: '04',
            title: 'Reflect & Improve',
            icon: TrendingUp,
            points: [
                'Document outcomes',
                'Review feedback & impact',
                'Improve future activities'
            ]
        }
    ];

    return (
        <section className={styles.aboutSection} id="about">
            <div className="container">
                {/* Section Title */}
                <motion.div
                    className={styles.sectionHeader}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className={styles.sectionTitle}>About Us</h2>
                </motion.div>

                {/* Two-Column Editorial Layout matching reference */}
                <div className={styles.editorialGrid}>
                    {/* Left Column: Official Logo + Emblem Frame + Quote */}
                    <motion.div
                        className={styles.leftCol}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={styles.emblemCircleWrapper}>
                            <div className={styles.emblemRing}>
                                <Image
                                    src="/uploads/nss-logo.png"
                                    alt="Official NSS MJCET Logo"
                                    width={180}
                                    height={180}
                                    className={styles.officialLogo}
                                    priority
                                />
                            </div>
                        </div>
                        <blockquote className={styles.quoteText}>
                            &ldquo;The best way to find yourself is to lose yourself in the service of others.&rdquo;
                        </blockquote>
                        <span className={styles.quoteAuthor}>— National Service Scheme · MJCET</span>
                    </motion.div>

                    {/* Right Column: Who We Are + Volunteer Photos */}
                    <motion.div
                        className={styles.rightCol}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={styles.textContent}>
                            <h3 className={styles.whoWeAreHeading}>Who we are</h3>
                            <p className={styles.leadParagraph}>
                                NSS MJCET is the official National Service Scheme unit of Muffakham Jah College of Engineering &amp; Technology, Hyderabad. Founded on the ethos of selfless service, our mission is to foster civic responsibility, leadership, and community empathy among student engineers.
                            </p>
                            <p className={styles.bodyParagraph}>
                                Through year-round blood donation drives, medical health camps, environmental tree plantations, educational outreach, and digital literacy campaigns, our volunteers actively build lasting solutions for societal challenges.
                            </p>
                        </div>

                        {/* Genuine Action Photographs */}
                        <div className={styles.photoGrid}>
                            <div className={styles.photoCard}>
                                <div className={styles.photoImgWrap}>
                                    <Image
                                        src="/uploads/events/1772212567791-NSS01-3.jpg"
                                        alt="NSS MJCET Volunteers In Action"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 30vw"
                                        className={styles.actionPhoto}
                                    />
                                </div>
                                <span className={styles.photoCaption}>Community Outreach Programme</span>
                            </div>
                            <div className={styles.photoCard}>
                                <div className={styles.photoImgWrap}>
                                    <Image
                                        src="/uploads/events/1772212567799-NSS01-1.jpg"
                                        alt="NSS MJCET Student Volunteers"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 30vw"
                                        className={styles.actionPhoto}
                                    />
                                </div>
                                <span className={styles.photoCaption}>Campus Leadership &amp; Teamwork</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* NSS Activity Cycle — Infographic Process */}
                <div className={styles.cycleSection}>
                    <div className={styles.cycleHeader}>
                        <span className={styles.cycleEyebrow}>Systematic Impact</span>
                        <h3 className={styles.cycleTitle}>The NSS Activity Cycle</h3>
                        <p className={styles.cycleSubtitle}>
                            How we plan, execute, and evaluate every community service initiative for maximum impact.
                        </p>
                    </div>

                    <div className={styles.cycleGrid}>
                        {cycleStages.map((stage, idx) => {
                            const IconComponent = stage.icon;
                            return (
                                <motion.div
                                    key={stage.number}
                                    className={styles.cycleCard}
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                                >
                                    <div className={styles.cycleCardTop}>
                                        <div className={styles.iconCircle}>
                                            <IconComponent size={20} className={styles.stageIcon} />
                                        </div>
                                        <span className={styles.stageNumber}>{stage.number}</span>
                                    </div>

                                    <h4 className={styles.stageTitle}>{stage.title}</h4>

                                    <ul className={styles.stagePoints}>
                                        {stage.points.map((pt, pIdx) => (
                                            <li key={pIdx}>{pt}</li>
                                        ))}
                                    </ul>

                                    {idx < cycleStages.length - 1 && (
                                        <div className={styles.cycleConnector}>
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
