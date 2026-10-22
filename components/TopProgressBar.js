'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './TopProgressBar.module.css';

export default function TopProgressBar() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);
    const resetTimerRef = useRef(null);

    // Complete and reset progress bar on route change
    useEffect(() => {
        if (visible) {
            setProgress(100);
            resetTimerRef.current = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
        }
        return () => {
            clearTimeout(resetTimerRef.current);
        };
    }, [pathname, visible]);

    // Intercept navigation link clicks for instant 0ms feedback
    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href) return;

            // Only trigger for internal route changes (not external, hash, or target="_blank")
            if (
                href.startsWith('/') &&
                !href.startsWith('//') &&
                !href.startsWith('/#') &&
                href !== pathname &&
                !anchor.target &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.shiftKey
            ) {
                clearTimeout(resetTimerRef.current);
                clearTimeout(timerRef.current);
                setVisible(true);
                setProgress(30);

                timerRef.current = setTimeout(() => {
                    setProgress(75);
                }, 180);
            }
        };

        document.addEventListener('click', handleClick, { capture: true });
        return () => {
            document.removeEventListener('click', handleClick, { capture: true });
            clearTimeout(timerRef.current);
            clearTimeout(resetTimerRef.current);
        };
    }, [pathname]);

    if (!visible) return null;

    return (
        <div className={styles.progressContainer}>
            <div
                className={styles.progressBar}
                style={{
                    width: `${progress}%`,
                    transition: progress === 100 ? 'width 0.15s ease-out, opacity 0.25s ease 0.1s' : 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: progress === 100 ? 0 : 1,
                }}
            />
            <div className={styles.progressGlow} style={{ left: `calc(${progress}% - 50px)` }} />
        </div>
    );
}
