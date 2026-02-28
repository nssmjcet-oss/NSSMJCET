'use client';

import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './LeadershipSection.module.css';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Building2 } from 'lucide-react';

export default function LeadershipSection() {
    const { language } = useLanguage();
    const [officerData, setOfficerData] = useState(null);
    const [chairmanData, setChairmanData] = useState(null);
    const [advisorData, setAdvisorData] = useState(null);

    useEffect(() => {
        // Fetch Program Officer
        fetch('/api/program-officer')
            .then(res => res.json())
            .then(json => {
                if (json.officer) setOfficerData(json.officer);
            })
            .catch(console.error);

        // Fetch Chairman
        fetch('/api/chairman')
            .then(res => res.json())
            .then(json => {
                if (json.chairman) setChairmanData(json.chairman);
            })
            .catch(console.error);

        // Fetch Advisor cum Director
        fetch('/api/advisor-director')
            .then(res => res.json())
            .then(json => {
                if (json.advisor) setAdvisorData(json.advisor);
            })
            .catch(console.error);
    }, []);

    const leadershipData = [
        {
            data: advisorData,
            role: 'Advisor cum Director',
            label: 'ADVISOR CUM DIRECTOR',
            accent: 'saffron'
        },
        {
            data: chairmanData,
            role: 'Chairman',
            label: 'CHAIRMAN',
            accent: 'green'
        },
        {
            data: officerData,
            role: 'Programme Officer',
            label: 'PROGRAMME OFFICER',
            accent: 'saffron'
        }
    ];

    return (
        <section className={styles.leadershipSection} id="leadership">
            <div className={styles.leadershipContainer}>
                {leadershipData.map((item, idx) => (
                    item.data && (
                        <LeadershipCard
                            key={idx}
                            item={item}
                            language={language}
                        />
                    )
                ))}

                <div className={styles.ashokaWatermark}>
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" />
                        {[...Array(24)].map((_, i) => (
                            <line
                                key={i}
                                x1="50" y1="50"
                                x2={50 + 48 * Math.cos((i * 15 * Math.PI) / 180)}
                                y2={50 + 48 * Math.sin((i * 15 * Math.PI) / 180)}
                                stroke="currentColor"
                                strokeWidth="0.2"
                            />
                        ))}
                    </svg>
                </div>
            </div>
        </section>
    );
}

function LeadershipCard({ item, language }) {
    const cardRef = useRef(null);
    const { data, label, accent, role } = item;

    // 3D Tilt Setup
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 100, damping: 20 });
    const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 100, damping: 20 });

    const handleMouseMove = (event) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        x.set((event.clientX - rect.left) / rect.width);
        y.set((event.clientY - rect.top) / rect.height);
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
        mouseX.set(0);
        mouseY.set(0);
    };

    // Spotlight Transform
    const spotlightBackground = useTransform(
        [mouseX, mouseY],
        ([sx, sy]) => `radial-gradient(700px circle at ${sx}px ${sy}px, var(--glow-${accent}), transparent 80%)`
    );

    const name = getText(data.name, language);
    const designation = getText(data.designation, language);
    const quote = getText(data.quote || data.message, language);
    const badge = getText(data.badge, language);

    return (
        <div className={styles.cardSection}>
            <h2 className={`${styles.sectionTitle} ${styles[accent]}`}>{role}</h2>
            <div className={styles.glassCard}>
                <motion.div
                    ref={cardRef}
                    className={`${styles.cardInner} ${styles[accent]}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    animate={{
                        y: [0, -8, 0],
                    }}
                    transition={{
                        opacity: { duration: 0.8 },
                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                >
                    <motion.div
                        className={styles.lightSweep}
                        animate={{ x: [-400, 1200] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                    />

                    <div className={styles.imageSection}>
                        <div className={styles.imgContainer}>
                            {data.photo ? (
                                <img src={data.photo} alt={name} className={styles.profileImg} />
                            ) : (
                                <div className={styles.placeholderImg}>
                                    <span>{name?.charAt(0)}</span>
                                </div>
                            )}
                            {badge && <div className={styles.badge}>{badge}</div>}
                        </div>
                    </div>

                    <div className={styles.contentSection}>
                        <span className={styles.roleLabel}>{label}</span>
                        <h3 className={styles.name}>{name}</h3>
                        <div className={styles.departmentBlock}>
                            <div className={styles.deptIcon}>
                                <Building2 size={22} />
                            </div>
                            <div className={styles.deptValue}>{designation}</div>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.quoteWrapper}>
                            <span className={styles.quoteIcon}>“</span>
                            <p className={styles.quote}>{quote}</p>
                        </div>
                    </div>

                    <motion.div
                        className={styles.spotlight}
                        style={{ background: spotlightBackground }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
