'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onComplete }) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const dismissedRef = useRef(false);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        // Check if already seen this session
        let alreadySeen = false;
        try {
            alreadySeen = !!sessionStorage.getItem('nss_splash_shown');
        } catch (_) { /* private mode */ }

        if (alreadySeen) {
            if (onCompleteRef.current) onCompleteRef.current();
            return;
        }

        // Mark seen immediately
        try { sessionStorage.setItem('nss_splash_shown', 'true'); } catch (_) {}

        setVisible(true);

        const dismiss = () => {
            if (dismissedRef.current) return;
            dismissedRef.current = true;
            setExiting(true);
            // Let the fade-out CSS animation play (300ms), then remove and call onComplete
            setTimeout(() => {
                setVisible(false);
                if (onCompleteRef.current) onCompleteRef.current();
            }, 320);
        };

        // Auto-dismiss after 1.8s (enough for logo + text to appear nicely)
        const timer = setTimeout(dismiss, 1800);

        return () => clearTimeout(timer);
    }, []); // ← empty deps: run ONCE on mount only

    const handleClick = () => {
        if (dismissedRef.current) return;
        dismissedRef.current = true;
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            if (onCompleteRef.current) onCompleteRef.current();
        }, 320);
    };

    if (!visible) return null;

    return (
        <div
            className={`${styles.splash} ${exiting ? styles.splashExit : ''}`}
            onClick={handleClick}
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
