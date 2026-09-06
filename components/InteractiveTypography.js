'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './InteractiveTypography.module.css';

/**
 * NSS MJCET — Flagship Initiative Interactive Typography System
 * 
 * Master Reusable Typographic Identity Component
 * Supports letter-by-letter proximity tracking, preset behaviors (diplomatic, civic, etc.),
 * accessible fallback, touch support, and accent color interpolation.
 */

// Approved NSS MJCET Brand Accents
const ACCENT_COLORS = {
    saffron: '#FF9933',
    green: '#138808',
    blue: '#2563eb',
    cyan: '#38bdf8',
    orange: '#ea580c',
};

// Preset parameters
const PRESETS = {
    diplomatic: {
        // Fluid, intellectual, diplomatic — for MUN x NSS
        radius: 130,
        maxTranslateY: -10,
        maxTranslateX: 6,
        maxRotate: 5,
        maxScale: 1.08,
        letterSpacingBoost: '0.04em',
        defaultAccent: 'saffron',
    },
    civic: {
        // Structured, authoritative, geometric — for Youth Parliament
        radius: 110,
        maxTranslateY: -6,
        maxTranslateX: 8,
        maxRotate: 1.5,
        maxScale: 1.04,
        letterSpacingBoost: '0.06em',
        defaultAccent: 'green',
    },
    editorial: {
        // Sophisticated, editorial, baseline shift
        radius: 120,
        maxTranslateY: -8,
        maxTranslateX: 2,
        maxRotate: -2,
        maxScale: 1.05,
        letterSpacingBoost: '0.03em',
        defaultAccent: 'saffron',
    },
    campaign: {
        // Dynamic, high energy, punchy
        radius: 140,
        maxTranslateY: -12,
        maxTranslateX: 4,
        maxRotate: 4,
        maxScale: 1.10,
        letterSpacingBoost: '0.05em',
        defaultAccent: 'blue',
    },
    minimal: {
        // Subtle, understated lift & color only
        radius: 90,
        maxTranslateY: -3,
        maxTranslateX: 0,
        maxRotate: 0,
        maxScale: 1.02,
        letterSpacingBoost: '0.01em',
        defaultAccent: 'saffron',
    },
    none: {
        radius: 0,
        maxTranslateY: 0,
        maxTranslateX: 0,
        maxRotate: 0,
        maxScale: 1,
        letterSpacingBoost: '0',
        defaultAccent: 'saffron',
    },
};

export default function InteractiveTypography({
    title = 'MUN x NSS',
    shortTitle,
    subtitle,
    accentColor = 'saffron',
    animationPreset = 'diplomatic',
    enabled = true,
    theme = 'dark', // 'dark' on cards (white text base), 'light' on light canvas (slate-900 base)
    size = 'xl', // 'xl' | 'lg' | 'md'
    className = '',
    onClick,
}) {
    const containerRef = useRef(null);
    const lettersRef = useRef([]);
    const shouldReduceMotion = useReducedMotion();

    const [isTouch, setIsTouch] = useState(false);
    const [letterStates, setLetterStates] = useState([]);

    // Resolve preset and accent
    const presetConfig = PRESETS[animationPreset] || PRESETS.diplomatic;
    const resolvedAccent = ACCENT_COLORS[accentColor] || accentColor || '#FF9933';

    // Split text into words and characters
    const displayTitle = title || shortTitle || 'MUN x NSS';
    const words = useMemo(() => {
        return displayTitle.split(' ').map((word) => word.split(''));
    }, [displayTitle]);

    const totalCharacters = useMemo(() => {
        return words.reduce((acc, chars) => acc + chars.length, 0);
    }, [words]);

    // Check touch device on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsTouch(window.matchMedia('(pointer: coarse)').matches);
        }
    }, []);

    // Initialize state array for every letter
    useEffect(() => {
        setLetterStates(
            Array(totalCharacters).fill({
                proximity: 0,
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                isActive: false,
            })
        );
        lettersRef.current = lettersRef.current.slice(0, totalCharacters);
    }, [totalCharacters]);

    // Track mouse movement and compute proximity field with requestAnimationFrame throttling
    const rafRef = useRef(null);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const handleMouseMove = useCallback(
        (e) => {
            if (!enabled || shouldReduceMotion || isTouch || animationPreset === 'none') return;
            if (!containerRef.current) return;

            lastMousePos.current = { x: e.clientX, y: e.clientY };

            if (rafRef.current) return;

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                const cursorX = lastMousePos.current.x;
                const cursorY = lastMousePos.current.y;
                const radius = presetConfig.radius;

                const nextStates = lettersRef.current.map((el, i) => {
                    if (!el) {
                        return { proximity: 0, x: 0, y: 0, rotate: 0, scale: 1, isActive: false };
                    }

                    const rect = el.getBoundingClientRect();
                    const letterCenterX = rect.left + rect.width / 2;
                    const letterCenterY = rect.top + rect.height / 2;

                    const dx = cursorX - letterCenterX;
                    const dy = cursorY - letterCenterY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > radius) {
                        return { proximity: 0, x: 0, y: 0, rotate: 0, scale: 1, isActive: false };
                    }

                    // Proximity factor (0 to 1) with smooth cosine dropoff
                    const norm = 1 - dist / radius;
                    const proximity = Math.sin((norm * Math.PI) / 2); // non-linear natural falloff

                    // Preset deterministic variations per character index
                    const directionMod = (i % 2 === 0 ? 1 : -1);
                    const charCode = displayTitle.charCodeAt(i % displayTitle.length) || 65;
                    const variance = ((charCode % 5) - 2) * 0.25; // -0.5 to +0.5

                    let targetY = presetConfig.maxTranslateY * proximity;
                    let targetX = presetConfig.maxTranslateX * proximity * directionMod * (1 + variance);
                    let targetRotate = presetConfig.maxRotate * proximity * directionMod * (1 + variance);
                    let targetScale = 1 + (presetConfig.maxScale - 1) * proximity;

                    // Special handling for multiplier/cross 'x' or 'X' or '×'
                    const char = el.innerText;
                    if (char === 'x' || char === 'X' || char === '×') {
                        targetRotate = -8 * proximity;
                        targetScale = 1 + 0.12 * proximity;
                    }

                    return {
                        proximity,
                        x: targetX,
                        y: targetY,
                        rotate: targetRotate,
                        scale: targetScale,
                        isActive: proximity > 0.35,
                    };
                });

                setLetterStates(nextStates);
            });
        },
        [enabled, shouldReduceMotion, isTouch, animationPreset, presetConfig, displayTitle]
    );

    // Smooth reset on mouse leave
    const handleMouseLeave = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (!enabled || shouldReduceMotion) return;
        setLetterStates((prev) =>
            prev.map(() => ({
                proximity: 0,
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                isActive: false,
            }))
        );
    }, [enabled, shouldReduceMotion]);

    // Base color for inactive letters
    const baseColor = theme === 'dark' ? '#FFFFFF' : '#0F172A';

    let globalIndex = 0;

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${styles[size]} ${styles[theme]} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            aria-label={displayTitle}
        >
            <div className={styles.titleLine}>
                {words.map((wordChars, wordIndex) => (
                    <span key={`w-${wordIndex}`} className={styles.word}>
                        {wordChars.map((char) => {
                            const charIdx = globalIndex++;
                            const state = letterStates[charIdx] || {
                                proximity: 0,
                                x: 0,
                                y: 0,
                                rotate: 0,
                                scale: 1,
                                isActive: false,
                            };

                            // Color interpolation based on proximity
                            const color = state.proximity > 0.05
                                ? (state.proximity > 0.5 ? resolvedAccent : interpolateColor(baseColor, resolvedAccent, state.proximity))
                                : baseColor;

                            return (
                                <motion.span
                                    key={`c-${charIdx}`}
                                    ref={(el) => (lettersRef.current[charIdx] = el)}
                                    className={styles.letter}
                                    style={{
                                        color,
                                        display: 'inline-block',
                                        transformOrigin: '50% 80%',
                                    }}
                                    animate={
                                        shouldReduceMotion
                                            ? {}
                                            : {
                                                  x: state.x,
                                                  y: state.y,
                                                  rotate: state.rotate,
                                                  scale: state.scale,
                                              }
                                    }
                                    transition={{
                                        type: 'spring',
                                        stiffness: 380,
                                        damping: 24,
                                        mass: 0.6,
                                    }}
                                >
                                    {char}
                                </motion.span>
                            );
                        })}
                        {wordIndex < words.length - 1 && (
                            <span className={styles.space}>&nbsp;</span>
                        )}
                    </span>
                ))}
            </div>

            {subtitle && (
                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}

// Lightweight RGB interpolation helper for fluid color transitions
function interpolateColor(color1, color2, factor) {
    if (factor <= 0) return color1;
    if (factor >= 1) return color2;

    const parse = (c) => {
        if (c.startsWith('#')) {
            const hex = c.replace('#', '');
            if (hex.length === 3) {
                return [
                    parseInt(hex[0] + hex[0], 16),
                    parseInt(hex[1] + hex[1], 16),
                    parseInt(hex[2] + hex[2], 16),
                ];
            }
            return [
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16),
            ];
        }
        return [255, 255, 255];
    };

    const [r1, g1, b1] = parse(color1);
    const [r2, g2, b2] = parse(color2);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `rgb(${r}, ${g}, ${b})`;
}
