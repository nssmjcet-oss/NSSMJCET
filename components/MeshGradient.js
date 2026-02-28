'use client';

import { useEffect, useRef } from 'react';
import styles from './MeshGradient.module.css';

export default function MeshGradient() {
    const meshRef = useRef(null);

    useEffect(() => {
        let rafId;
        const handleMouseMove = (e) => {
            if (!meshRef.current) return;

            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                const { clientX, clientY } = e;
                const x = (clientX / window.innerWidth) * 100;
                const y = (clientY / window.innerHeight) * 100;

                meshRef.current.style.setProperty('--mouse-x', `${x}%`);
                meshRef.current.style.setProperty('--mouse-y', `${y}%`);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            className={`${styles.meshContainer} ${styles.patrioticMode}`}
            ref={meshRef}
        >
            <div className={styles.backgroundLayer} />
            <div className={`${styles.blob} ${styles.blob1}`} />
            <div className={`${styles.blob} ${styles.blob2}`} />
            <div className={`${styles.blob} ${styles.blob3}`} />
            <div className={`${styles.blob} ${styles.blob4}`} />
            <div className={styles.noise} />
        </div>
    );
}
