'use client';

import { useState } from 'react';
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
        subtitle: 'Upcoming and Past Events',
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
        subtitle: 'రాబోయే మరియు గత ఈవెంట్స్',
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
        subtitle: 'आगामी और पिछले कार्यक्रम',
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
    const [selectedEvent, setSelectedEvent] = useState(null);

    const now = new Date();
    const filteredEvents = events.filter(event => {
        // Prioritize manual eventType if it exists
        if (event.eventType) {
            if (filter === 'upcoming') return event.eventType === 'upcoming';
            if (filter === 'past') return event.eventType === 'past';
            return true;
        }

        // Fallback to date-based logic for older events
        const eventDate = new Date(event.date);
        if (filter === 'upcoming') return eventDate >= now;
        if (filter === 'past') return eventDate < now;
        return true;
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
                <motion.div
                    className={styles.filters}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        {t.all}
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'upcoming' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        {t.upcoming}
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'past' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        {t.past}
                    </button>
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
                                                        hover: { scale: 1.15 }
                                                    }}
                                                    initial="rest"
                                                />
                                                <div className={`${styles.eventStatus} ${isUpcoming ? styles.statusUpcoming : styles.statusPast}`}>
                                                    <span className={styles.statusDot}></span>
                                                    {isUpcoming ? t.upcoming : t.past}
                                                </div>
                                                <div className={styles.eventDate}>
                                                    <div className={styles.dateDay}>
                                                        {eventDate.getDate()}
                                                    </div>
                                                    <div className={styles.dateMonth}>
                                                        {eventDate.toLocaleDateString(language === 'en' ? 'en-US' : language === 'te' ? 'te-IN' : 'hi-IN', { month: 'short' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.eventContent}>
                                                <h3>{event.title[language] || event.title.en}</h3>
                                                <p className={styles.eventDescription}>
                                                    {(event.description[language] || event.description.en).substring(0, 160)}...
                                                </p>
                                                <div className={styles.eventMeta}>
                                                    <div className={styles.metaRow}>
                                                        <Calendar size={14} className={styles.metaIcon} />
                                                        <span>{formatDate(event.date, language === 'en' ? 'en-IN' : language === 'te' ? 'te-IN' : 'hi-IN')}</span>
                                                    </div>
                                                    <div className={styles.metaRow}>
                                                        <MapPin size={14} className={styles.metaIcon} />
                                                        <span>{event.location}</span>
                                                    </div>
                                                </div>
                                                <button className={styles.viewBtn}>
                                                    {t.readMore}
                                                    <ArrowRight size={16} className={styles.btnArrow} />
                                                </button>
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
