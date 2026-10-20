'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithCache } from '@/utils/client-cache';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './gallery.module.css';

// Fallback authentic NSS MJCET event photographs
const defaultPhotos = [
    { id: 'd1', title: 'Youth Community Rally', category: 'Community Service', src: '/uploads/events/1772212213205-20251110130725.jpg' },
    { id: 'd2', title: 'Annual Youth Convention', category: 'Special Events', src: '/uploads/events/1772212213217-20251110152340.jpg' },
    { id: 'd3', title: 'Faculty Interactive Forum', category: 'Campus Activities', src: '/uploads/events/1772212213224-20251110145020.jpg' },
    { id: 'd4', title: 'Campus Cultural Initiative', category: 'Awareness Programmes', src: '/uploads/events/1772219830828-Untitleddesign4.jpg' },
    { id: 'd5', title: 'Volunteer Training Programme', category: 'Volunteer Activities', src: '/uploads/events/1772258937302-DSC90851.jpg' },
    { id: 'd6', title: 'Social Service Induction', category: 'Community Service', src: '/uploads/events/1772212567791-NSS01-3.jpg' },
    { id: 'd7', title: 'NSS Student Volunteers', category: 'Campus Activities', src: '/uploads/events/1772212567799-NSS01-1.jpg' },
];

const CATEGORIES = ['All Moments', 'Community Service', 'Health & Awareness', 'Campus Activities', 'Youth Parliament & MUN', 'Volunteer Life'];

export default function GalleryPage() {
    const { language } = useLanguage();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All Moments');
    const [lightboxPhoto, setLightboxPhoto] = useState(null);

    useEffect(() => {
        // Fetch fresh gallery items from /api/gallery
        fetch('/api/gallery', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                const galleryItems = data?.items || [];
                const mapped = [];

            // Map gallery items from admin/database
            galleryItems.forEach((item, idx) => {
                const src = item.image || item.imageUrl || item.url || item.src;
                if (src) {
                    mapped.push({
                        id: item._id || item.id || `g-${idx}`,
                        title: typeof item.title === 'object' ? (item.title?.en || Object.values(item.title)[0]) : (item.title || 'NSS Initiative'),
                        category: item.category || 'Community Service',
                        caption: item.caption || '',
                        src: src,
                    });
                }
            });

            // If gallery has items from DB/admin, use them; otherwise use default authentic photos
            if (mapped.length > 0) {
                setPhotos(mapped);
            } else {
                setPhotos(defaultPhotos);
            }
            setLoading(false);
        }).catch(() => {
            setPhotos(defaultPhotos);
            setLoading(false);
        });
    }, [language]);

    const normalizeCategory = (cat) => {
        if (!cat) return 'Community Service';
        if (cat === 'Awareness Programmes' || cat === 'Health & Sanitation') return 'Health & Awareness';
        if (cat === 'Volunteer Activities' || cat === 'Volunteer Drives') return 'Volunteer Life';
        if (cat === 'Special Events' || cat === 'MUN / Diplomacy' || cat === 'Youth Parliament') return 'Youth Parliament & MUN';
        if (cat === 'Blood Donation' || cat === 'Flagship Drives' || cat === 'Community Outreach') return 'Community Service';
        if (cat === 'General' || cat === 'General Activities') return 'Community Service';
        return cat;
    };

    const filtered = activeCategory === 'All Moments'
        ? photos
        : photos.filter(p => normalizeCategory(p.category) === activeCategory || p.category === activeCategory);

    return (
        <div className={styles.galleryPage}>
            {/* Hero Header matching Image 2 */}
            <section className={styles.hero}>
                <div className="container">
                    <motion.div
                        className={styles.eyebrowWrap}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className={styles.eyebrowLine} />
                        <span className={styles.eyebrowText}>NSS MJCET · MOMENTS THAT MATTER</span>
                    </motion.div>
                    <motion.h1
                        className={styles.heroTitle}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Stories of <em>Service</em>
                    </motion.h1>
                    <motion.p
                        className={styles.heroSubtitle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        A collection of moments that reflect our commitment to community, leadership, and meaningful change.
                    </motion.p>
                </div>
            </section>

            <div className="container">
                {/* Category Filter Tabs matching Image 2 */}
                <motion.div
                    className={styles.filterRow}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* Photo Count matching Image 2 */}
                {!loading && (
                    <motion.div
                        className={styles.countRow}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                    >
                        <span className={styles.photoCount}>{filtered.length} PHOTOGRAPHS</span>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner} />
                        <p>Loading gallery...</p>
                    </div>
                )}

                {/* Photo Grid */}
                {!loading && (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={activeCategory}
                            className={styles.photoGrid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            layout
                        >
                            {filtered.map((photo, idx) => (
                                <motion.div
                                    key={photo.id}
                                    className={styles.photoItem}
                                    layout
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.92 }}
                                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                                    onClick={() => setLightboxPhoto(photo)}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className={styles.imgWrapper}>
                                        <Image
                                            src={photo.src}
                                            alt={photo.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className={styles.photo}
                                            onError={(e) => { if (e.target) e.target.src = '/placeholder-event.jpg'; }}
                                        />
                                        <div className={styles.overlay}>
                                            <span className={styles.photoCategory}>{photo.category}</span>
                                            <h4 className={styles.photoTitle}>{photo.title}</h4>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}

                {!loading && filtered.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No photos in this category yet.</p>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxPhoto && (
                    <motion.div
                        className={styles.lightboxBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxPhoto(null)}
                    >
                        <motion.div
                            className={styles.lightboxContent}
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.88, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.lightboxClose} onClick={() => setLightboxPhoto(null)} aria-label="Close">✕</button>
                            <div className={styles.lightboxImgWrap}>
                                <Image
                                    src={lightboxPhoto.src}
                                    alt={lightboxPhoto.title}
                                    fill
                                    sizes="100vw"
                                    className={styles.lightboxImg}
                                    style={{ objectFit: 'contain' }}
                                    onError={(e) => { if (e.target) e.target.src = '/placeholder-event.jpg'; }}
                                />
                            </div>
                            <div className={styles.lightboxMeta}>
                                <span className={styles.lightboxCategory}>{lightboxPhoto.category}</span>
                                <h3 className={styles.lightboxTitle}>{lightboxPhoto.title}</h3>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
