'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './EventSlider.module.css';

export default function EventSlider({ onViewDetails }) {
    const { language } = useLanguage();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                if (data.events && data.events.length > 0) {
                    setEvents(data.events);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch events:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <section className={styles.eventSection}>
            <div className="container">
                <h2 className={styles.sectionTitle}>
                    {language === 'en' ? 'EVENTS' : language === 'te' ? 'మా కార్యక్రమాలు' : 'हमारे कार्यक्रम'}
                </h2>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(0,0,0,0.4)' }}>Loading...</div>
            </div>
        </section>
    );

    // Duplicate cards for a seamless infinite loop
    const loopedEvents = events.length > 0 ? [...events, ...events, ...events] : [];

    return (
        <section className={styles.eventSection}>
            <div className="container">
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {language === 'en' ? 'EVENTS' : language === 'te' ? 'మా కార్యక్రమాలు' : 'हमारे कार्यक्रम'}
                </motion.h2>

                {events.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>{language === 'en' ? 'Stay tuned for upcoming events!' : language === 'te' ? 'రాబోయే కార్యక్రమాల కోసం వేచి ఉండండి!' : 'आगामी कार्यक्रमों के लिए बने रहें!'}</p>
                    </div>
                )}
            </div>

            {events.length > 0 && (
                <div
                    className={styles.sliderWrapper}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <div
                        className={styles.sliderTrack}
                        style={{ animationPlayState: paused ? 'paused' : 'running' }}
                    >
                        {loopedEvents.map((event, index) => (
                            <EventCard
                                key={`${event._id || event.id}-${index}`}
                                event={event}
                                language={language}
                                onViewDetails={() => onViewDetails(event)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function EventCard({ event, language, onViewDetails }) {
    const title = getText(event.title, language);
    const description = getText(event.description, language);
    const coverImage = event.images && event.images.length > 0 ? event.images[0] : '/placeholder-event.jpg';

    const cardVariants = {
        rest: {
            y: 0,
            scale: 1,
            boxShadow: "0 6px 24px -8px rgba(0, 0, 0, 0.1)",
        },
        hover: {
            y: -12,
            scale: 1.02,
            boxShadow: "0 24px 54px -12px rgba(255, 153, 51, 0.3), 0 0 0 2px rgba(255, 153, 51, 0.3)",
            transition: {
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
            }
        },
        tap: {
            scale: 0.98,
        }
    };

    const imageVariants = {
        rest: {
            filter: "grayscale(70%) brightness(0.88) contrast(1.05)",
            scale: 1,
        },
        hover: {
            filter: "grayscale(0%) brightness(1.02) contrast(1)",
            scale: 1.08,
            transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
            }
        },
        tap: {
            filter: "grayscale(0%) brightness(1.02) contrast(1)",
            scale: 1.08,
        }
    };

    const titleVariants = {
        rest: { y: 0, color: "#1e293b" },
        hover: {
            y: -3,
            color: "#FF9933",
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const btnVariants = {
        rest: { opacity: 0.7, x: 0 },
        hover: {
            opacity: 1,
            x: 3,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            className={styles.eventCard}
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
        >
            <div className={styles.imageWrapper}>
                <motion.img
                    src={coverImage}
                    alt={title}
                    className={styles.image}
                    loading="lazy"
                    variants={imageVariants}
                />
                <div className={styles.imageOverlay} />
                <div className={styles.dateBadge}>
                    <span className={styles.day}>{new Date(event.date).getDate()}</span>
                    <span className={styles.month}>
                        {new Date(event.date).toLocaleString(language === 'en' ? 'en-US' : language === 'te' ? 'te-IN' : 'hi-IN', { month: 'short' })}
                    </span>
                </div>
            </div>
            <div className={styles.cardContent}>
                <motion.h3 className={styles.eventTitle} variants={titleVariants}>{title}</motion.h3>
                <p className={styles.eventDescription}>
                    {description.length > 80 ? `${description.substring(0, 80)}...` : description}
                </p>
                <div className={styles.cardFooter}>
                    <div className={styles.location}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span>{event.location}</span>
                    </div>
                    <motion.button
                        className={styles.viewBtn}
                        onClick={onViewDetails}
                        variants={btnVariants}
                    >
                        {language === 'en' ? 'View Details' : language === 'te' ? 'వివరాలు చూడండి' : 'विवरण देखें'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
