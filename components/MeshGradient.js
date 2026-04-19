'use client';

import { useEffect, useRef } from 'react';
import styles from './MeshGradient.module.css';

export default function MeshGradient() {
    const meshRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!meshRef.current) return;
            // Directly update CSS variables on the container
            // This is more efficient than forcing a React render or using a continuous RAF loop
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;

            meshRef.current.style.setProperty('--mouse-x', `${x}%`);
            meshRef.current.style.setProperty('--mouse-y', `${y}%`);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
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
