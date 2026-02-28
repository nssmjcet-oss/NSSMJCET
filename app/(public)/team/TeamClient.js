'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import styles from './team.module.css';
import { motion } from 'framer-motion';

const translations = {
    en: {
        title: 'Our Team',
        subtitle: 'Meet the NSS MJCET Team',
        gbs: 'Governing Body',
        execom: 'Executive Committee',
        core: 'Core Members',
        noMembers: 'No team members found',
    },
    te: {
        title: 'మా టీమ్',
        subtitle: 'NSS MJCET టీమ్‌ను కలవండి',
        gbs: 'గవర్నింగ్ బాడీ',
        execom: 'ఎగ్జిక్యూటివ్ కమిటీ',
        core: 'కోర్ సభ్యులు',
        noMembers: 'టీమ్ సభ్యులు కనుగొనబడలేదు',
    },
    hi: {
        title: 'हमारी टीम',
        subtitle: 'एनएसएस एमजेसीईटी टीम से मिलें',
        gbs: 'शासी निकाय',
        execom: 'कार्यकारी समिति',
        core: 'मुख्य सदस्य',
        noMembers: 'कोई टीम सदस्य नहीं मिला',
    },
};

export default function TeamClient({ members }) {
    const { language } = useLanguage();
    const t = translations[language];


    const gbsMembers = members.filter(m => m.role === 'GB');
    const execomMembers = members.filter(m => m.role === 'Execom');
    const coreMembers = members.filter(m => m.role === 'Core');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05 // Reduced stagger for speed
            }
        }
    };

    return (
        <div className={styles.teamPage}>
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
                {gbsMembers.length > 0 && (
                    <section className={styles.section}>
                        <motion.h2
                            className={styles.sectionTitle}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {t.gbs}
                        </motion.h2>
                        <motion.div
                            className={styles.teamGrid}
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {gbsMembers.map((member) => (
                                <MemberCard key={member._id} member={member} />
                            ))}
                        </motion.div>
                    </section>
                )}

                {execomMembers.length > 0 && (
                    <section className={styles.section}>
                        <motion.h2
                            className={styles.sectionTitle}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {t.execom}
                        </motion.h2>
                        <motion.div
                            className={styles.teamGrid}
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {execomMembers.map((member) => (
                                <MemberCard key={member._id} member={member} />
                            ))}
                        </motion.div>
                    </section>
                )}

                {coreMembers.length > 0 && (
                    <section className={styles.section}>
                        <motion.h2
                            className={styles.sectionTitle}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {t.core}
                        </motion.h2>
                        <motion.div
                            className={styles.teamGrid}
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {coreMembers.map((member) => (
                                <MemberCard key={member._id} member={member} />
                            ))}
                        </motion.div>
                    </section>
                )}

                {members.length === 0 && (
                    <div className={styles.noMembers}>
                        <p>{t.noMembers}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MemberCard({ member }) {
    const { language } = useLanguage();

    const nameStr = typeof member.name === 'object' ? (member.name[language] || member.name.en || '') : (member.name || '');
    const positionStr = typeof member.position === 'object' ? (member.position[language] || member.position.en || '') : (member.position || '');

    const initials = nameStr
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const cardVariants = {
        rest: {
            scale: 1,
            y: 0,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        },
        hover: {
            scale: 1.03,
            y: -10,
            boxShadow: "0 20px 48px -10px rgba(255, 153, 51, 0.28), 0 0 0 2px rgba(255, 153, 51, 0.35)",
            transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
            }
        },
        tap: {
            scale: 0.97,
            y: 0,
        }
    };

    const imageVariants = {
        rest: {
            filter: "grayscale(70%) brightness(0.88)",
            scale: 1,
        },
        hover: {
            filter: "grayscale(0%) brightness(1.03)",
            scale: 1.1,
            transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
            }
        },
        tap: {
            filter: "grayscale(0%) brightness(1.03)",
            scale: 1.1,
        }
    };

    const textVariants = {
        rest: { y: 0, opacity: 0.9 },
        hover: {
            y: -3,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            className={styles.memberBox}
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
        >
            <div className={styles.memberAvatar}>
                {member.image ? (
                    <motion.img
                        src={member.image}
                        alt={nameStr}
                        variants={imageVariants}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                    />
                ) : (
                    <motion.div
                        className={styles.avatarPlaceholder}
                        variants={imageVariants}
                    >
                        {initials}
                    </motion.div>
                )}
                <div className={styles.avatarGlowOverlay} />
            </div>
            <motion.div className={styles.memberInfo} variants={textVariants}>
                <h3>{nameStr}</h3>
                {positionStr && <p className={styles.position}>{positionStr}</p>}
                {(member.linkedin || member.github) && (
                    <div className={styles.socialLinks}>
                        {member.linkedin && (
                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label="LinkedIn"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        )}
                        {member.github && (
                            <a
                                href={member.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label="GitHub"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
