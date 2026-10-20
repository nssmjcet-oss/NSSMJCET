'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, Mail } from 'lucide-react';
import styles from './NewsletterSection.module.css';

export default function NewsletterSection() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;
        setSubmitted(true);
    };

    return (
        <section className={styles.newsletterSection}>
            <div className="container">
                <motion.div
                    className={styles.bannerCard}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Background photo */}
                    <div className={styles.bgImgWrapper}>
                        <Image
                            src="/uploads/nss-team-hero.jpg"
                            alt="NSS MJCET Volunteers"
                            fill
                            sizes="100vw"
                            className={styles.bgImg}
                        />
                        <div className={styles.bgOverlay} />
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        <span className={styles.eyebrow}>Newsletter</span>
                        <h3 className={styles.title}>Stay Updated with NSS MJCET</h3>
                        <p className={styles.description}>
                            Never miss an update. Follow our ongoing initiatives, upcoming drives, and student impact stories directly.
                        </p>

                        {submitted ? (
                            <div className={styles.successMessage}>
                                <div className={styles.checkCircle}>
                                    <Check size={18} />
                                </div>
                                <span>Thank you for subscribing to NSS MJCET updates!</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.inputWrap}>
                                    <Mail size={18} className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <button type="submit" className={styles.submitBtn}>
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
