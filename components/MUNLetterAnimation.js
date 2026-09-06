'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import styles from './MUNLetterAnimation.module.css';
import { Sparkles, Compass } from 'lucide-react';

export default function MUNLetterAnimation({
    title = 'MUNX NSS',
    subtitle = 'Model United Nations & Global Diplomacy Conference',
    tag = 'SIGNATURE DIPLOMACY INITIATIVE'
}) {
    const containerRef = useRef(null);
    const prefersReducedMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    // Per-letter scroll transforms
    const translateY_M = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [0, 0, 0] : [20, -35, 15]);
    const rotate_M = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [0, 0, 0] : [-8, 0, 6]);

    const translateY_U = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [0, 0, 0] : [-15, 25, -10]);
    const rotate_U = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [0, 0, 0] : [6, -4, 8]);

    const translateY_N = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [0, 0, 0] : [10, -20, 20]);
    const scale_N = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [1, 1, 1] : [0.95, 1.15, 1]);

    const rotate_X = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [0, 0, 0] : [0, 45, 90]);
    const scale_X = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [1, 1, 1] : [1, 1.28, 1.1]);
    const color_X = useTransform(scrollYProgress, [0, 0.5, 1], ['#FF9933', '#e07800', '#138808']);

    const translateY_General = useTransform(scrollYProgress, [0, 0.5, 1], prefersReducedMotion ? [0, 0, 0] : [10, -10, 5]);

    // Parse the title characters
    const chars = title.split('');

    return (
        <div ref={containerRef} className={styles.munContainer}>
            {tag && (
                <div className={styles.badgePill}>
                    <Sparkles size={14} />
                    <span>{tag}</span>
                </div>
            )}

            <div className={styles.lettersRow}>
                {chars.map((char, index) => {
                    if (char === ' ') {
                        return <span key={index} style={{ width: 'clamp(1rem, 3vw, 2.5rem)' }} />;
                    }

                    const upper = char.toUpperCase();

                    if (upper === 'M') {
                        return (
                            <motion.span
                                key={index}
                                className={styles.letterSpan}
                                style={{
                                    y: translateY_M,
                                    rotate: rotate_M,
                                    color: '#1a1a1a'
                                }}
                            >
                                {char}
                            </motion.span>
                        );
                    }

                    if (upper === 'U') {
                        return (
                            <motion.span
                                key={index}
                                className={styles.letterSpan}
                                style={{
                                    y: translateY_U,
                                    rotate: rotate_U,
                                    color: '#262626'
                                }}
                            >
                                {char}
                            </motion.span>
                        );
                    }

                    if (upper === 'N' && index < 3) {
                        return (
                            <motion.span
                                key={index}
                                className={styles.letterSpan}
                                style={{
                                    y: translateY_N,
                                    scale: scale_N,
                                    color: '#0f172a'
                                }}
                            >
                                {char}
                            </motion.span>
                        );
                    }

                    if (upper === 'X') {
                        return (
                            <motion.span
                                key={index}
                                className={styles.letterXSpecial}
                                style={{
                                    rotate: rotate_X,
                                    scale: scale_X,
                                    color: color_X
                                }}
                            >
                                {char}
                            </motion.span>
                        );
                    }

                    // Default letter
                    return (
                        <motion.span
                            key={index}
                            className={styles.letterSpan}
                            style={{
                                y: translateY_General,
                                color: index % 2 === 0 ? '#1e293b' : '#334155'
                            }}
                        >
                            {char}
                        </motion.span>
                    );
                })}
            </div>

            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

            <div className={styles.scrollHint}>
                <Compass size={14} style={{ color: '#FF9933' }} />
                <span>Scroll to interact with delegates platform</span>
            </div>
        </div>
    );
}
