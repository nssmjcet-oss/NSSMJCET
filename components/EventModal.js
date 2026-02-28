'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/formatters';
import styles from './EventModal.module.css';

export default function EventModal({ event, onClose }) {
    const { language } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!event) return null;

    const title = getText(event.title, language);
    const description = getText(event.description, language);
    const images = event.images && event.images.length > 0 ? event.images : ['/placeholder-event.jpg'];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.modal}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>

                    <div className={styles.contentGrid}>
                        <div className={styles.imageSection}>
                            <div className={styles.mainImageWrapper}>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${title} image ${currentImageIndex + 1}`}
                                    className={styles.mainImage}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevImage}>&#10094;</button>
                                        <button className={`${styles.navBtn} ${styles.next}`} onClick={nextImage}>&#10095;</button>
                                        <div className={styles.imageDots}>
                                            {images.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`${styles.dot} ${idx === currentImageIndex ? styles.activeDot : ''}`}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={styles.infoSection}>
                            <div className={styles.modalHeader}>
                                <span className={styles.dateTag}>{formatDate(event.date)}</span>
                                <h2 className={styles.title}>{title}</h2>
                                <div className={styles.locationTag}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <div className={styles.descriptionWrapper}>
                                <p className={styles.description}>{description}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
