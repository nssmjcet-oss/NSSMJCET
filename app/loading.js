'use client';

import styles from './loading.module.css';

export default function Loading() {
    return (
        <div className={styles.topProgressBar} aria-hidden="true">
            <div className={styles.topProgressFill} />
        </div>
    );
}

