'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onComplete }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 800); // wait for exit animation
        }, 3200);

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
                                src="/uploads/nss-logo (1).png"
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
                        >
                            &quot;Not Me But You&quot;
                        </motion.p>

                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
