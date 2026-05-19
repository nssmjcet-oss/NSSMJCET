'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/formatters';
import styles from './events.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import EventModal from '@/components/EventModal';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';

const translations = {
    // ... same as before
    en: {
        title: 'Events',
        subtitle: 'Empowering Communities, Inspiring Change',
        upcoming: 'Upcoming Events',
        past: 'Past Events',
        all: 'All Events',
        noEvents: 'No events found',
        readMore: 'Read More',
        date: 'Date',
        location: 'Location',
    },
    te: {
        title: 'ఈవెంట్స్',
        subtitle: 'సమాజ సేవ - నిరంతర ప్రయాణం',
        upcoming: 'రాబోయే ఈవెంట్స్',
        past: 'గత ఈవెంట్స్',
        all: 'అన్ని ఈవెంట్స్',
        noEvents: 'ఈవెంట్స్ కనుగొనబడలేదు',
        readMore: 'మరింత చదవండి',
        date: 'తేదీ',
        location: 'స్థలం',
    },
    hi: {
        title: 'कार्यक्रम',
        subtitle: 'सच्ची सेवा, निरंतर बदलाव',
        upcoming: 'आगामी कार्यक्रम',
        past: 'पिछले कार्यक्रम',
        all: 'सभी कार्यक्रम',
        noEvents: 'कोई कार्यक्रम नहीं मिला',
        readMore: 'अधिक पढ़ें',
        date: 'तारीख',
        location: 'स्थान',
    },
};

export default function EventsClient({ events }) {
    const { language } = useLanguage();
    const t = translations[language];
    const [filter, setFilter] = useState('all');
    const [selectedYear, setSelectedYear] = useState('2025-2026'); // Default to 2025-2026 as requested
    const [selectedEvent, setSelectedEvent] = useState(null);
    const searchParams = useSearchParams();

    // Deep-link: /events?open=<eventId> opens that event's modal automatically
    useEffect(() => {
        const openId = searchParams.get('open');
        if (openId && events.length > 0) {
            const target = events.find(ev => (ev.id || ev._id) === openId);
            if (target) {
                setSelectedYear('ALL'); // ensure the event is visible
                setFilter('all');
                setTimeout(() => setSelectedEvent(target), 300);
            }
        }
    }, [searchParams, events]);

    // Fallback: Automatically extract academic year from date if not manually configured
    const getAcademicYear = (dateStr) => {
        if (!dateStr) return '2025-2026';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed (June is 5)
        
        if (month >= 5) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    };

    // Extract dynamic unique years from active database events, making sure 2025-2026 is visible
    const defaultYears = ['2025-2026', '2024-2025'];
    const academicYears = Array.from(
        new Set([
            'ALL',
            ...defaultYears,
            ...events.map(e => e.academicYear || getAcademicYear(e.date))
        ])
    ).filter(Boolean).sort((a, b) => {
        if (a === 'ALL') return -1;
        if (b === 'ALL') return 1;
        return a.localeCompare(b); // Ascending chronological order
    });

    const now = new Date();
    const filteredEvents = events.filter(event => {
        // 1. Filter by Status/Date (Upcoming / Past)
        let matchesCategory = true;
        if (event.eventType) {
            if (filter === 'upcoming') matchesCategory = event.eventType === 'upcoming';
            else if (filter === 'past') matchesCategory = event.eventType === 'past';
        } else {
            const eventDate = new Date(event.date);
            if (filter === 'upcoming') matchesCategory = eventDate >= now;
            else if (filter === 'past') matchesCategory = eventDate < now;
        }

        if (!matchesCategory) return false;

        // 2. Filter by Academic Year
        if (selectedYear === 'ALL') return true;
        const eventYear = event.academicYear || getAcademicYear(event.date);
        return eventYear === selectedYear;
    });

    return (
        <div className={styles.eventsPage}>
            <section className={styles.hero}>
                <div className="container">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {t.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {t.subtitle}
                    </motion.p>
                </div>
            </section>

            <div className="container">
                {/* Elegant Dynamic Year Slider - Premium styling relevant to the light/glass bg theme */}
                <motion.div
                    className={styles.yearSliderContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <div className={styles.yearSliderLabel}>
                        <Calendar size={14} style={{ color: '#FF9933' }} />
                        <span>Academic Session</span>
                    </div>
                    <div className={styles.yearSlider}>
                        {academicYears.map((year) => (
                            <button
                                key={year}
                                className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ''}`}
                                onClick={() => setSelectedYear(year)}
                            >
                                {year === 'ALL' ? 'All Sessions' : year}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className={styles.resultsArea}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        {filteredEvents.length === 0 ? (
                            <motion.div
                                key="no-events"
                                className={styles.noEvents}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p>{t.noEvents}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="events-grid"
                                className={styles.eventsGrid}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                layout
                            >
                                {filteredEvents.map((event) => {
                                    const eventDate = new Date(event.date);
                                    const isUpcoming = event.eventType ? event.eventType === 'upcoming' : eventDate >= now;

                                    return (
                                        <motion.div
                                            key={event._id}
                                            className={styles.eventBox}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            whileHover="hover"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className={styles.imageWrapper}>
                                                <motion.img
                                                    src={(event.images && event.images.length > 0) ? event.images[0] : '/placeholder-event.jpg'}
                                                    alt={event.title[language] || event.title.en}
                                                    className={styles.eventImage}
                                                    variants={{
                                                        rest: { scale: 1 },
                                                        hover: { scale: 1.05 }
                                                    }}
                                                    initial="rest"
                                                />
                                                <div className={`${styles.eventStatus} ${isUpcoming ? styles.statusUpcoming : styles.statusPast}`}>
                                                    {isUpcoming ? t.upcoming : 'COMPLETED'}
                                                </div>
                                            </div>
                                            <div className={styles.eventContent}>
                                                <div className={styles.dateRow}>
                                                    <Calendar size={14} className={styles.dateIcon} />
                                                    <span>
                                                        {event.endDate && event.endDate !== event.date
                                                            ? `${formatDate(event.date, language === 'en' ? 'en-IN' : language === 'te' ? 'te-IN' : 'hi-IN')} - ${formatDate(event.endDate, language === 'en' ? 'en-IN' : language === 'te' ? 'te-IN' : 'hi-IN')}`.toUpperCase()
                                                            : formatDate(event.date, language === 'en' ? 'en-IN' : language === 'te' ? 'te-IN' : 'hi-IN').toUpperCase()}
                                                    </span>
                                                </div>
                                                <h3>{event.title[language] || event.title.en}</h3>
                                                <p className={styles.eventDescription}>
                                                    {(event.description[language] || event.description.en).substring(0, 120)}...
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <EventModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
}
