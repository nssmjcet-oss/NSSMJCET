'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { fetchWithCache } from '@/utils/client-cache';
import styles from './GallerySection.module.css';

// Default authentic NSS MJCET event photographs
const defaultGalleryPhotos = [
    {
        id: '1',
        title: 'Youth Community Rally',
        category: 'Community Service',
        src: '/uploads/events/1772212213205-20251110130725.jpg',
        span: 'colSpan1'
    },
    {
        id: '2',
        title: 'Annual Youth Convention & Dialogue',
        category: 'Special Events',
        src: '/uploads/events/1772212213217-20251110152340.jpg',
        span: 'colSpan2'
    },
    {
        id: '3',
        title: 'Leadership & Faculty Interactive Forum',
        category: 'Campus Activities',
        src: '/uploads/events/1772212213224-20251110145020.jpg',
        span: 'colSpan1'
    },
    {
        id: '4',
        title: 'Campus Musical & Cultural Initiative',
        category: 'Awareness Programmes',
        src: '/uploads/events/1772219830828-Untitleddesign4.jpg',
        span: 'colSpan1'
    },
    {
        id: '5',
        title: 'Student Volunteer Training & Outreach',
        category: 'Volunteer Activities',
        src: '/uploads/events/1772258937302-DSC90851.jpg',
        span: 'colSpan1'
    },
    {
        id: '6',
        title: 'Social Service Induction & Workshop',
        category: 'Community Service',
        src: '/uploads/events/1772212567791-NSS01-3.jpg',
        span: 'colSpan2'
    }
];

export default function GallerySection() {
    const [photos, setPhotos] = useState(defaultGalleryPhotos);

    useEffect(() => {
        fetchWithCache('/api/gallery')
            .then(data => {
                if (data?.items && data.items.length >= 4) {
                    const mapped = data.items.slice(0, 6).map((item, idx) => ({
                        id: item._id || item.id || idx,
                        title: item.title?.en || item.title || 'NSS Initiative',
                        category: item.category || 'Service',
                        src: item.imageUrl || item.url || defaultGalleryPhotos[idx % defaultGalleryPhotos.length].src,
                        span: idx === 1 || idx === 5 ? 'colSpan2' : 'colSpan1'
                    }));
                    setPhotos(mapped);
                }
            })
            .catch(() => {
                // Fallback preserved
            });
    }, []);

    return (
        <section className={styles.gallerySection} id="gallery">
            <div className="container">
                {/* Section Header */}
                <div className={styles.sectionHeader}>
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Gallery
                    </motion.h2>
                </div>

                {/* Editorial Asymmetric Image Grid */}
                <div className={styles.editorialGalleryGrid}>
                    {photos.map((photo, idx) => (
                        <motion.div
                            key={photo.id || idx}
                            className={`${styles.galleryItem} ${styles[photo.span] || styles.colSpan1}`}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.08 }}
                        >
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={photo.src}
                                    alt={photo.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className={styles.galleryImage}
                                />
                                <div className={styles.overlay}>
                                    <span className={styles.photoCategory}>{photo.category}</span>
                                    <h4 className={styles.photoTitle}>{photo.title}</h4>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                <div className={styles.actionRow}>
                    <Link href="/events" className={styles.viewAllBtn}>
                        <span>VIEW ALL</span>
                        <Plus size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
