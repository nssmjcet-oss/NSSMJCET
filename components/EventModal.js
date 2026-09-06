'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/formatters';
import styles from './EventModal.module.css';
import { Sparkles, Award, FileText } from 'lucide-react';

import { fetchWithCache } from '@/utils/client-cache';

export default function EventModal({ event, onClose }) {
    const { language } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fullEvent, setFullEvent] = useState(null);

    useEffect(() => {
        setCurrentImageIndex(0);
        setFullEvent(null);
        if (event?.id || event?._id) {
            fetchWithCache(`/api/events?id=${event.id || event._id}`)
                .then(data => {
                    if (data?.event) setFullEvent(data.event);
                })
                .catch(() => {});
        }
    }, [event]);

    if (!event) return null;

    const displayEvent = fullEvent || event;
    const title = getText(displayEvent.title, language);
    const description = getText(displayEvent.description, language);
    const images = displayEvent.images && displayEvent.images.length > 0 ? displayEvent.images : ['/placeholder-event.jpg'];

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
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
                    <button className={styles.mobileBackBtn} onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        <span>Go Back</span>
                    </button>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>

                    <div className={styles.contentGrid}>
                        <div className={styles.imageSection}>
                            <div className={styles.mainImageWrapper}>
                                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                                    <Image
                                        src={images[currentImageIndex]}
                                        alt={`${title} image ${currentImageIndex + 1}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className={styles.mainImage}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        unoptimized={typeof images[currentImageIndex] === 'string' && images[currentImageIndex].startsWith('data:')}
                                        onError={(e) => {
                                            if (e.target) e.target.src = '/placeholder-event.jpg';
                                        }}
                                    />
                                </div>
                                {images.length > 1 && (
                                    <>
                                        <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevImage}>&#10094;</button>
                                        <button className={`${styles.navBtn} ${styles.next}`} onClick={nextImage}>&#10095;</button>
                                        
                                        <div className={styles.imageCounter}>
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>


                        <div className={styles.infoSection}>
                            <div className={styles.modalHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    <span className={styles.dateTag}>
                                        {event.endDate && event.endDate !== event.date
                                            ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                                            : formatDate(event.date)}
                                    </span>
                                    {displayEvent.eventType && (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            letterSpacing: '0.05em',
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            textTransform: 'uppercase',
                                            background: displayEvent.eventType === 'ongoing' ? 'rgba(245, 158, 11, 0.15)' :
                                                        displayEvent.eventType === 'completed' ? 'rgba(19, 136, 8, 0.15)' :
                                                        displayEvent.eventType === 'archived' ? 'rgba(100, 116, 139, 0.15)' :
                                                        'rgba(255, 153, 51, 0.15)',
                                            color: displayEvent.eventType === 'ongoing' ? '#d97706' :
                                                   displayEvent.eventType === 'completed' ? '#138808' :
                                                   displayEvent.eventType === 'archived' ? '#64748b' :
                                                   '#FF9933',
                                            border: `1px solid ${
                                                displayEvent.eventType === 'ongoing' ? 'rgba(245, 158, 11, 0.3)' :
                                                displayEvent.eventType === 'completed' ? 'rgba(19, 136, 8, 0.3)' :
                                                displayEvent.eventType === 'archived' ? 'rgba(100, 116, 139, 0.3)' :
                                                'rgba(255, 153, 51, 0.3)'
                                            }`
                                        }}>
                                            {displayEvent.eventType === 'ongoing' ? '● Live Now' : displayEvent.eventType}
                                        </span>
                                    )}
                                </div>
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

                                {/* Post-Event Outcomes / Highlights */}
                                {displayEvent.highlights && (
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '16px',
                                        background: '#fff9f2',
                                        border: '1px solid rgba(255, 153, 51, 0.3)',
                                        borderRadius: '16px'
                                    }}>
                                        <h4 style={{ color: '#FF9933', fontSize: '13px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Sparkles size={15} />
                                            <span>Event Highlights</span>
                                        </h4>
                                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line' }}>
                                            {displayEvent.highlights}
                                        </p>
                                    </div>
                                )}

                                {/* Winners */}
                                {displayEvent.winners && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '16px',
                                        background: '#f0fdf4',
                                        border: '1px solid rgba(19, 136, 8, 0.3)',
                                        borderRadius: '16px'
                                    }}>
                                        <h4 style={{ color: '#138808', fontSize: '13px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Award size={15} />
                                            <span>Winners & Recognition</span>
                                        </h4>
                                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#1e293b', whiteSpace: 'pre-line' }}>
                                            {displayEvent.winners}
                                        </p>
                                    </div>
                                )}

                                {/* Official Summary / Report */}
                                {displayEvent.report && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '16px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '16px'
                                    }}>
                                        <h4 style={{ color: '#475569', fontSize: '13px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FileText size={15} />
                                            <span>Official Event Report</span>
                                        </h4>
                                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                                            {displayEvent.report}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
