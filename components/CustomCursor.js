'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const moveCursor = (e) => {
            if (!cursorRef.current) return;
            // Directly update CSS variables on the container to avoid React re-renders
            cursorRef.current.style.setProperty('--cursor-x', `${e.clientX}px`);
            cursorRef.current.style.setProperty('--cursor-y', `${e.clientY}px`);
        };

        const onMouseOver = (e) => {
            const el = e.target.closest('a, button, [role="button"], input, textarea, select, label');
            if (el) setIsHovering(true);
        };

        const onMouseOut = (e) => {
            const el = e.target.closest('a, button, [role="button"], input, textarea, select, label');
            if (el) setIsHovering(false);
        };

        window.addEventListener('mousemove', moveCursor, { passive: true });
        window.addEventListener('mouseover', onMouseOver);
        window.addEventListener('mouseout', onMouseOut);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', onMouseOver);
            window.removeEventListener('mouseout', onMouseOut);
        };
    }, [isMobile]);

    if (isMobile) return null;

    return (
        <div ref={cursorRef} className={styles.cursorWrapper}>
            {/* Dot — center of cursor */}
            <div className={`${styles.cursorDot} ${isHovering ? styles.hovering : ''}`} />

            {/* Ring — Ashoka chakra inspired */}
            <div className={`${styles.cursorRing} ${isHovering ? styles.ringHovering : ''}`}>
                <svg viewBox="0 0 80 80" className={styles.chakraSvg}>
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2" fill="none" />
                    {[...Array(24)].map((_, i) => (
                        <line
                            key={i}
                            x1="40" y1="40"
                            x2={40 + 35 * Math.cos((i * 15 * Math.PI) / 180)}
                            y2={40 + 35 * Math.sin((i * 15 * Math.PI) / 180)}
                            stroke="currentColor"
                            strokeWidth="0.7"
                            opacity="0.5"
                        />
                    ))}
                    <circle cx="40" cy="40" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
            </div>
        </div>
    );
}
