'use client';

import { useState, useEffect } from 'react';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import styles from './GoverningBody.module.css';

export default function GoverningBodySection() {
    const { language } = useLanguage();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/governing-body')
            .then(res => res.json())
            .then(data => {
                if (data.members) setMembers(data.members);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (!loading && members.length === 0) return null;

    return (
        <section className={styles.section} id="governing-body">
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7 }}
                >
                    <span className={styles.sectionLabel}>NSS MJCET</span>
                    <h2 className={styles.sectionTitle}>Governing Body</h2>
                    <p className={styles.sectionSub}>The leadership council driving NSS MJCET forward</p>
                </motion.div>

                <div className={styles.grid}>
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.skeletonCard} />
                        ))
                        : members.map((member, idx) => (
                            <motion.div
                                key={member.id}
                                className={styles.memberCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.6, delay: idx * 0.08 }}
                            >
                                <div className={styles.cardInner}>
                                    <div className={styles.photoWrap}>
                                        {member.photo ? (
                                            <img
                                                src={member.photo}
                                                alt={getText(member.name, language)}
                                                className={styles.photo}
                                            />
                                        ) : (
                                            <div className={styles.photoPlaceholder}>
                                                {getText(member.name, language)?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.info}>
                                        <h3 className={styles.name}>{getText(member.name, language)}</h3>
                                        <p className={styles.designation}>{getText(member.designation, language)}</p>

                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.linkedinLink}
                                                aria-label="LinkedIn Profile"
                                            >
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.glowBorder} />
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}
