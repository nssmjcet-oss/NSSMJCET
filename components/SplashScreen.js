'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onComplete }) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem('nss_splash_shown')) {
                if (onComplete) onComplete();
                return;
            }
            sessionStorage.setItem('nss_splash_shown', 'true');
        } catch (e) {}
        setVisible(true);
        // Start fade-out at 550ms
        const exitTimer = setTimeout(() => {
            setExiting(true);
        }, 550);

        // Completely remove from DOM at 800ms
        const removeTimer = setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
        }, 800);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [onComplete]);

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
        }, 200);
    };

    if (!visible) return null;

    return (
        <div
            className={`${styles.splash} ${exiting ? styles.splashExit : ''}`}
            onClick={handleDismiss}
            style={{ cursor: 'pointer' }}
        >
            <div className={styles.content}>
                {/* Logo */}
                <div className={`${styles.logoWrap} ${styles.fadeUp}`}>
                    <Image
                        src="/uploads/nss-logo.png"
                        alt="NSS Logo"
                        width={180}
                        height={180}
                        className={styles.logo}
                        priority
                    />
                </div>

                {/* NSS MJCET title */}
                <h1 className={`${styles.title} ${styles.fadeUpDelay1}`}>
                    NSS MJCET
                </h1>

                {/* Subtitle */}
                <p className={`${styles.subtitle} ${styles.fadeUpDelay2}`}>
                    &quot;Not Me But You&quot;
                </p>
            </div>
        </div>
    );
}
