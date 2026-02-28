'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Github, Linkedin } from 'lucide-react';
import styles from './DevelopersSection.module.css';

const dreamyReveal = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

export default function DevelopersSection() {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Added cache: 'no-store' to ensure we get the latest data
        fetch('/api/developers', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.developers) setDevelopers(data.developers);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch developers error:', err);
                setLoading(false);
            });
    }, []);

    // Removed the null return to ensure the header always stays visible
    // and we can see the loading/empty states.

    return (
        <section className={styles.secContainer} id="developers">
            <div className="container">
                <div className={styles.header}>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Meet The Developers
                    </motion.h2>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        The talented team behind the innovation
                    </motion.p>
                </div>

                <div className={styles.devGrid}>
                    {developers.length > 0 ? (
                        developers.map((dev, index) => (
                            <DeveloperCard key={dev.id || index} dev={dev} index={index} />
                        ))
                    ) : (
                        <div className={styles.emptyGrid}>
                            {loading ? 'Discovering our innovators...' : 'Developer profiles coming soon.'}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.radialGlow} />
        </section>
    );
}

function DeveloperCard({ dev, index }) {
    const cardRef = useRef(null);
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [0, 1], [10, -10]), { stiffness: 100, damping: 20 });
    const rotateY = useSpring(useTransform(x, [0, 1], [-10, 10]), { stiffness: 100, damping: 20 });

    const spotlightX = useSpring(mouseX, { stiffness: 150, damping: 25 });
    const spotlightY = useSpring(mouseY, { stiffness: 150, damping: 25 });

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
        <motion.div
            ref={cardRef}
            className={styles.devCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
        >
            <motion.div
                className={styles.cardInner}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
            >
                {/* Spotlight Cursor Glow */}
                <motion.div
                    className={styles.spotlight}
                    style={{
                        background: useTransform(
                            [spotlightX, spotlightY],
                            ([sx, sy]) => `radial-gradient(400px circle at ${sx}px ${sy}px, rgba(37, 99, 235, 0.15), transparent 80%)`
                        )
                    }}
                />

                <div className={styles.imageWrapper}>
                    {dev.image ? (
                        <img src={dev.image} alt={dev.name} className={styles.devPhoto} />
                    ) : (
                        <div className={styles.photoPlaceholder}>
                            {dev.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                    )}
                </div>

                <div className={styles.content}>
                    <h3 className={styles.name}>{dev.name || 'NSS Developer'}</h3>
                    <p className={styles.role}>{dev.role || 'Contributor'}</p>

                    <div className={styles.socials}>
                        {(dev.github_url || dev.github) && (
                            <a href={dev.github_url || dev.github} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="GitHub">
                                <Github size={18} />
                            </a>
                        )}
                        {(dev.linkedin_url || dev.linkedin) && (
                            <a href={dev.linkedin_url || dev.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
            <div className={styles.glowBorder} />
        </motion.div>
    );
}
