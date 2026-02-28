'use client';

import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './FacultyAdvisor.module.css';
import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const defaultData = {
    name: { en: 'Dr. Laxmi', te: '', hi: '' },
    designation: { en: 'Program Officer', te: '', hi: '' },
    qualification: { en: '', te: '', hi: '' },
    quote: { en: '', te: '', hi: '' },
    photo: '',
};

const titleTranslations = {
    en: 'PROGRAMME OFFICER',
    te: 'ప్రోగ్రామ్ అధికారి',
    hi: 'कार्यक्रम अधिकारी',
};

export default function FacultyAdvisor() {
    const { language } = useLanguage();
    const [data, setData] = useState(defaultData);
    const cardRef = useRef(null);

    // 3D Tilt & Spotlight Setup
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 100, damping: 20 });
    const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 100, damping: 20 });

    // Spotlight Gradient Position
    const spotlightX = useSpring(mouseX, { stiffness: 150, damping: 25 });
    const spotlightY = useSpring(mouseY, { stiffness: 150, damping: 25 });

    // Parallax Image Effect
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"]
    });
    const imgY = useTransform(scrollYProgress, [0, 1], [-25, 25]);

    useEffect(() => {
        fetch('/api/program-officer')
            .then(res => res.json())
            .then(json => {
                if (json.officer && (json.officer.name?.en || json.officer.name)) {
                    setData(json.officer);
                }
            })
            .catch(console.error);
    }, []);

    const name = getText(data.name, language);
    const designation = getText(data.designation, language) || 'Program Officer';
    const qualification = getText(data.qualification, language);
    const quote = getText(data.quote, language);
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
        <section className={styles.facultySection}>
            <div className="container">
                <motion.div
                    ref={cardRef}
                    className={styles.facultyCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
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
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Dynamic Spotlight Glow - Saffron + Blue */}
                        <motion.div
                            className={styles.spotlight}
                            style={{
                                background: useTransform(
                                    [spotlightX, spotlightY],
                                    ([sx, sy]) => `radial-gradient(700px circle at ${sx}px ${sy}px, rgba(255, 153, 51, 0.15), rgba(30, 64, 175, 0.05), transparent 80%)`
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
                                            className={styles.facultyImage}
                                            style={{ y: imgY }}
                                            initial={{ filter: "grayscale(70%)" }}
                                            whileHover={{ filter: "grayscale(0%)", scale: 1.05 }}
                                            whileTap={{ filter: "grayscale(0%)", scale: 1.05 }}
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
                                    <div className={styles.titleWrapper}>
                                        <h2 className={styles.sectionTitle}>{getText(titleTranslations, language)}</h2>
                                        <motion.div
                                            className={styles.saffronUnderline}
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "100%" }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.advisorInfo}>
                                    <h3 className={styles.advisorName}>{name}</h3>

                                    {qualification && (
                                        <p className={styles.qualification}>{qualification}</p>
                                    )}

                                    {qualification && <div className={styles.roleTag}><span>{qualification}</span></div>}

                                    {quote && (
                                        <div className={styles.messageBox}>
                                            <div className={styles.quoteMark}>&ldquo;</div>
                                            <p className={styles.message}>{quote}</p>
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
