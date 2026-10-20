'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import { fetchWithCache } from '@/utils/client-cache';
import styles from './UpcomingEventsSection.module.css';

export default function UpcomingEventsSection({ onSelectEvent }) {
    const { language } = useLanguage();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWithCache('/api/events')
            .then(data => {
                const list = data?.events || (Array.isArray(data) ? data : []);
                setEvents(list);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch upcoming events:', err);
                setLoading(false);
            });
    }, []);

    // Curate display events: prioritize published, up to 3-4 cards
    const displayEvents = events.length > 0 ? events.slice(0, 4) : [];

    // Date formatting helper
    const formatDateParts = (dateStr) => {
        if (!dateStr) return { day: '28', monthYear: 'OCT 2026', weekday: 'SUN' };
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { day: '28', monthYear: 'OCT 2026', weekday: 'SUN' };
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const year = d.getFullYear();
        const weekday = d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
        return { day, monthYear: `${month} ${year}`, weekday };
    };

    return (
        <section className={styles.eventsSection} id="events">
            <div className="container">
                {/* Section Header matching reference */}
                <div className={styles.sectionHeader}>
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Upcoming Events
                    </motion.h2>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner} />
                        <p>Loading scheduled events...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && displayEvents.length === 0 && (
                    <motion.div
                        className={styles.emptyState}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className={styles.emptyText}>No upcoming events at the moment. Check back soon.</p>
                        <Link href="/events" className="marvelous-btn marvelous-btn-outline marvelous-btn-sm">
                            Browse Past Activities
                        </Link>
                    </motion.div>
                )}

                {/* Clean Editorial Card Grid matching reference */}
                {!loading && displayEvents.length > 0 && (
                    <div className={styles.eventsGrid}>
                        {displayEvents.map((event, idx) => {
                            const title = getText(event.title, language) || 'NSS Community Initiative';
                            const desc = getText(event.description, language) || 'Join NSS MJCET volunteers for an impactful social drive.';
                            const coverImg = (event.images && event.images[0]) || '/uploads/events/1772212567791-NSS01-3.jpg';
                            const dateInfo = formatDateParts(event.date);

                            return (
                                <motion.div
                                    key={event._id || event.id || idx}
                                    className={styles.eventCard}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                >
                                    {/* Event Photo */}
                                    <div className={styles.imgWrap}>
                                        <Image
                                            src={coverImg}
                                            alt={title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className={styles.eventImg}
                                        />
                                        {event.category && (
                                            <span className={styles.categoryBadge}>{event.category}</span>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className={styles.cardBody}>
                                        <h3 className={styles.eventTitle}>{title}</h3>
                                        <p className={styles.eventDesc}>{desc}</p>

                                        {/* Date Callout with Day, Month & Venue */}
                                        <div className={styles.dateRow}>
                                            <div className={styles.dayCol}>
                                                <span className={styles.dayNumber}>{dateInfo.day}</span>
                                                <div className={styles.dayMeta}>
                                                    <span className={styles.weekdayText}>{dateInfo.weekday}</span>
                                                    <span className={styles.monthText}>{dateInfo.monthYear}</span>
                                                </div>
                                            </div>

                                            {event.location && (
                                                <div className={styles.venueCol}>
                                                    <MapPin size={14} className={styles.venueIcon} />
                                                    <span className={styles.venueText}>{event.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* RSVP / View Details Action Button */}
                                        <button
                                            type="button"
                                            onClick={() => onSelectEvent && onSelectEvent(event)}
                                            className={styles.rsvpBtn}
                                        >
                                            View Details / RSVP
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* See All Events Button */}
                <div className={styles.actionRow}>
                    <Link href="/events" className={styles.seeAllBtn}>
                        <span>SEE ALL EVENTS</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
