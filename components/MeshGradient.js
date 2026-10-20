'use client';

import { memo } from 'react';
import styles from './MeshGradient.module.css';

// Lightweight ambient layer — the actual background image is on <html> in globals.css
const MeshGradient = memo(function MeshGradient() {
    return (
        <div className={styles.meshContainer}>
            <div className={`${styles.blob} ${styles.blob1}`} />
            <div className={`${styles.blob} ${styles.blob2}`} />
        </div>
    );
});

export default MeshGradient;
