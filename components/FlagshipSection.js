'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './FlagshipSection.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import InteractiveTypography from './InteractiveTypography';

export default function FlagshipSection({ flagships = [], allEvents = [], onSelectEvent }) {
    const { language } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);

    if (!flagships || flagships.length === 0) return null;

    const currentInitiative = flagships[activeIndex] || flagships[0];
    const matchedEvent = allEvents.find(e => e.id === currentInitiative.linkedEventId || e._id === currentInitiative.linkedEventId);

    const isMUN = (currentInitiative.tagline?.en || '').toLowerCase().includes('mun') || 
                  (currentInitiative.title?.en || '').toLowerCase().includes('mun') ||
                  (currentInitiative.short_title || '').toLowerCase().includes('mun') ||
                  (matchedEvent?.title?.en || '').toLowerCase().includes('mun');

    const displayTitle = currentInitiative.short_title || currentInitiative.shortTitle || 
                         (isMUN ? 'MUN x NSS' : (currentInitiative.title?.[language] || currentInitiative.title?.en || 'NSS Flagship Initiative'));

    const displaySubtitle = (currentInitiative.title?.[language] || currentInitiative.title?.en || '') !== displayTitle
        ? (currentInitiative.title?.[language] || currentInitiative.title?.en)
        : (currentInitiative.tagline?.[language] || currentInitiative.tagline?.en || '');
    const description = currentInitiative.description?.[language] || currentInitiative.description?.en || matchedEvent?.description?.[language] || matchedEvent?.description?.en || 'An intensive signature initiative driven by NSS MJCET to create sustainable community impact.';
    const tag = currentInitiative.tag?.[language] || currentInitiative.tag?.en || (typeof matchedEvent?.category === 'object' ? (matchedEvent?.category?.[language] || matchedEvent?.category?.en) : matchedEvent?.category) || 'FLAGSHIP INITIATIVE';
    
    // Choose image
    const image = currentInitiative.heroImage || currentInitiative.image || (matchedEvent?.images && matchedEvent.images.length > 0 ? matchedEvent.images[0] : matchedEvent?.image) || '/placeholder-event.jpg';

    // Formatted date
    const dateSource = matchedEvent?.date || currentInitiative.date;
    const endDateSource = matchedEvent?.endDate;
    const formattedDate = dateSource ? (
        endDateSource && endDateSource !== dateSource
            ? `${formatDate(dateSource, language === 'en' ? 'en-IN' : language === 'te' ? 'te-IN' : 'hi-IN')} - ${formatDate(endDateSource, language === 'en' ? 'en-IN' : language === 'te' ? 'te-IN' : 'hi-IN')}`
            : formatDate(dateSource, language === 'en' ? 'en-IN' : language === 'te' ? 'te-IN' : 'hi-IN')
    ) : null;

    const locationStr = matchedEvent?.location || currentInitiative.location || 'MJCET Campus, Hyderabad';

    const handleCardClick = () => {
        if (matchedEvent && onSelectEvent) {
            onSelectEvent(matchedEvent);
        }
    };

    return (
        <section className={styles.flagshipHeroSection} id="flagship-initiatives">
            <div className="container">
                {/* Section Header */}
                <div className={styles.sectionHeader}>
                    <div className={styles.badgeLabel}>
                        <Sparkles size={13} />
                        <span>OUR FLAGSHIP INITIATIVES</span>
                    </div>
                    <h2 className={styles.mainHeading}>Signature Social Drives</h2>
                    <p className={styles.subHeading}>
                        Transformative benchmark campaigns setting new precedents in youth leadership and civic impact.
                    </p>

                    {/* Switcher Tabs for Multiple Flagships (e.g. MUNX NSS, Youth Parliament) */}
                    {flagships.length > 1 && (
                        <div className={styles.switcherPillWrap}>
                            <div className={styles.switcherPill}>
                                {flagships.map((item, idx) => {
                                    const tabName = item.short_title || item.shortTitle || (item.title?.[language] || item.title?.en || `Initiative ${idx + 1}`);
                                    return (
                                        <button
                                            key={item.id || idx}
                                            type="button"
                                            className={`${styles.tabBtn} ${activeIndex === idx ? styles.tabBtnActive : ''}`}
                                            onClick={() => setActiveIndex(idx)}
                                        >
                                            {tabName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Cinematic Featured Card (matching events featured initiative banner) */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentInitiative.id || currentInitiative.slug || activeIndex}
                        className={styles.featuredCard}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        onClick={handleCardClick}
                    >
                        {/* Full-bleed Background Image */}
                        <div className={styles.featuredBg}>
                            <Image
                                src={image}
                                alt={displayTitle}
                                fill
                                sizes="100vw"
                                className={styles.featureImg}
                                priority
                                unoptimized={typeof image === 'string' && image.startsWith('data:')}
                                onError={(e) => {
                                    if (e.target) e.target.src = '/placeholder-event.jpg';
                                }}
                            />
                        </div>

                        {/* Rich Dark Gradient Overlay */}
                        <div className={styles.featuredOverlay} />

                        {/* Content Block */}
                        <div className={styles.featuredContent}>
                            <div className={styles.titleGroup}>
                                <InteractiveTypography
                                    title={displayTitle}
                                    subtitle={displaySubtitle && displaySubtitle.toLowerCase() !== displayTitle.toLowerCase()
                                        ? displaySubtitle
                                        : (tag && tag.toLowerCase() !== 'featured' ? tag : 'Youth Diplomacy Summit')}
                                    animationPreset={currentInitiative.animationPreset || (isMUN ? 'diplomatic' : 'civic')}
                                    accentColor={currentInitiative.accentColor || 'saffron'}
                                    theme="dark"
                                    size="xl"
                                />
                            </div>

                            {/* Meta items: Formatted Date & Location */}
                            <div className={styles.featuredMeta}>
                                {formattedDate && (
                                    <div className={styles.featuredMetaItem}>
                                        <Calendar size={15} style={{ color: '#93c5fd' }} />
                                        <span>{formattedDate}</span>
                                    </div>
                                )}
                                {locationStr && (
                                    <div className={styles.featuredMetaItem}>
                                        <MapPin size={15} style={{ color: '#93c5fd' }} />
                                        <span>{locationStr}</span>
                                    </div>
                                )}
                            </div>

                            <p className={styles.featuredDesc}>
                                {description}
                            </p>

                            {/* Action Buttons */}
                            <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
                                {matchedEvent ? (
                                    <button
                                        type="button"
                                        className={styles.primaryBtn}
                                        onClick={() => onSelectEvent && onSelectEvent(matchedEvent)}
                                    >
                                        <span>Explore Initiative</span>
                                        <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <Link
                                        href={`/events${currentInitiative.linkedEventId ? `?open=${currentInitiative.linkedEventId}` : ''}`}
                                        className={styles.primaryBtn}
                                    >
                                        <span>Explore Initiative</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                )}

                                <Link href="/events" className={styles.secondaryBtn}>
                                    <span>All Drives</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
