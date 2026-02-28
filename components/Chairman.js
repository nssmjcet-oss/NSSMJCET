'use client';

import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './Chairman.module.css';
import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const defaultData = {
    name: { en: 'Dr. Chairman', te: '', hi: '' },
    designation: { en: 'Chairman', te: '', hi: '' },
    qualification: { en: '', te: '', hi: '' },
    message: { en: '', te: '', hi: '' },
    photo: '',
};

export default function Chairman() {
    const { language } = useLanguage();
    const [data, setData] = useState(defaultData);
    const cardRef = useRef(null);

    // 3D Tilt & Spotlight Setup
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [0, 1], [7, -7]), { stiffness: 100, damping: 20 });
    const rotateY = useSpring(useTransform(x, [0, 1], [-7, 7]), { stiffness: 100, damping: 20 });

    // Spotlight Gradient Position
    const spotlightX = useSpring(mouseX, { stiffness: 150, damping: 25 });
    const spotlightY = useSpring(mouseY, { stiffness: 150, damping: 25 });

    // Parallax Image Effect
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"]
    });
    const imgY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

    useEffect(() => {
        fetch('/api/chairman')
            .then(res => res.json())
            .then(json => {
                if (json.chairman && (json.chairman.name?.en || json.chairman.name)) {
                    setData(json.chairman);
                }
            })
            .catch(console.error);
    }, []);

    const name = getText(data.name, language);
    const designation = getText(data.designation, language) || 'Chairman';
    const qualification = getText(data.qualification, language);
    const message = getText(data.message, language);
    const badge = getText(data.badge, language);

    const handleMouseMove = (event) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = event.clientX - rect.left;
        const mouseYVal = event.clientY - rect.top;

        x.set(mouseXVal / width);
        y.set(mouseYVal / height);
        mouseX.set(mouseXVal);
        mouseY.set(mouseYVal);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <section className={styles.chairmanSection}>
            <div className="container">
                <motion.div
                    ref={cardRef}
                    className={styles.chairmanCard}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Floating Idle Animation Wrapper */}
                    <motion.div
                        className={styles.cardInner}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Dynamic Spotlight Glow */}
                        <motion.div
                            className={styles.spotlight}
                            style={{
                                background: useTransform(
                                    [spotlightX, spotlightY],
                                    ([sx, sy]) => `radial-gradient(600px circle at ${sx}px ${sy}px, rgba(19, 136, 8, 0.12), transparent 80%)`
                                )
                            }}
                        />

                        <div className={styles.cardGrid}>
                            <div className={styles.imageWrapper}>
                                <div className={styles.imageContainer}>
                                    {data.photo ? (
                                        <motion.img
                                            src={data.photo}
                                            alt={name}
                                            className={styles.chairmanImage}
                                            style={{ y: imgY }}
                                            initial={{ filter: "grayscale(70%)" }}
                                            whileHover={{ filter: "grayscale(0%)", scale: 1.05 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.imageBorderGlow} />
                                {badge && <div className={styles.badge}>{badge}</div>}
                            </div>

                            <div className={styles.contentContainer}>
                                <div className={styles.headerArea}>
                                    <div className={styles.accentLine} />
                                    <h2 className={styles.sectionTitle}>{designation}</h2>
                                </div>

                                <div className={styles.advisorInfo}>
                                    <h3 className={styles.advisorName}>{name}</h3>

                                    {qualification && (
                                        <p className={styles.qualification}>{qualification}</p>
                                    )}

                                    {/* Role Tag removed or combined with badge/designation if redundant,
                                        but I'll keep it as a secondary detail like 'Department' */}
                                    {qualification && <div className={styles.roleTag}><span>{qualification}</span></div>}

                                    {message && (
                                        <div className={styles.messageBox}>
                                            <div className={styles.quoteMark}>&ldquo;</div>
                                            <p className={styles.message}>{message}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
