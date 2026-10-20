'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onComplete }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only show once per session so navigating between pages feels instant
        try {
            const hasSeen = sessionStorage.getItem('nss_splash_shown');
            if (hasSeen) {
                if (onComplete) onComplete();
                return;
            }
            sessionStorage.setItem('nss_splash_shown', 'true');
            setVisible(true);
        } catch (e) {
            // If storage disabled, show once and skip
            if (onComplete) onComplete();
            return;
        }

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 500); // exit animation
        }, 1600); // Crisp 1.6s intro for first-time visitors

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className={styles.splash}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Simplified focused view */}

                    {/* Center content */}
                    <div className={styles.content}>
                        {/* Logo */}
                        <motion.div
                            className={styles.logoWrap}
                            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Image
                                src="/uploads/nss-logo.png"
                                alt="NSS Logo"
                                width={180}
                                height={180}
                                className={styles.logo}
                                priority
                            />
                        </motion.div>

                        {/* NSS MJCET text */}
                        <motion.h1
                            className={styles.title}
                            initial={{ opacity: 0, y: 15, letterSpacing: '0.1em' }}
                            animate={{ opacity: 1, y: 0, letterSpacing: '0.2em' }}
                            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            NSS MJCET
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            className={styles.subtitle}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                        >
                            &quot;Not Me, But You&quot;
                        </motion.p>

                        {/* Subtle navy and gold progress line */}
                        <motion.div
                            className={styles.loaderBar}
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: '120px' }}
                            transition={{ delay: 0.5, duration: 1.0, ease: "easeInOut" }}
                        >
                            <span className={styles.loaderGlow} />
                        </motion.div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
