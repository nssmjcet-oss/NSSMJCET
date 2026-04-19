'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './EventsPortalBanner.module.css';

export default function EventsPortalBanner() {
    const { language } = useLanguage();
    const [portals, setPortals] = useState([]);

    useEffect(() => {
        fetch('/api/portals')
            .then((res) => res.json())
            .then((data) => {
                if (data.portals && data.portals.length > 0) {
                    setPortals(data.portals);
                }
            })
            .catch((err) => console.error('Failed to fetch portals:', err));
    }, []);

    // Only render the banner if there are portals to display or we want to show a fallback
    // In this case, we always show it, but only show buttons if we have portals.
    
    const bannerVariant = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
        }
    };

    return (
        <section className={styles.bannerWrapper}>
            <div className="container">
                <motion.div 
                    className={styles.bannerCard}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={bannerVariant}
                >
                    <div className={styles.content}>
                        <span className={styles.tag}>
                            {language === 'te' ? 'కొత్తది' : language === 'hi' ? 'नया' : 'NEW LAUNCH'}
                        </span>
                        <h2 className={styles.title}>
                            {getText({
                                en: 'Experience Our Flagship Events Portal',
                                te: 'మా ఫ్లాగ్‌షిప్ ఈవెంట్స్ పోర్టల్‌ను అనుభవించండి',
                                hi: 'हमारे फ्लैगशिप इवेंट्स पोर्टल का अनुभव करें'
                            }, language)}
                        </h2>
                        <p className={styles.description}>
                            {getText({
                                en: 'Discover our flagship events and exclusive gatherings.',
                                te: 'మా ఫ్లాగ్‌షిప్ ఈవెంట్స్ మరియు ప్రత్యేక సమావేశాలను కనుగొనండి.',
                                hi: 'हमारे प्रमुख आयोजनों और विशेष समारोहों की खोज करें।'
                            }, language)}
                        </p>
                    </div>

                    <div className={styles.actionArea}>
                        {portals.length > 0 ? (
                            portals.map((portal) => (
                                <a 
                                    key={portal.id}
                                    href={portal.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={styles.portalBtn}
                                    title={portal.description?.[language] || portal.description?.en || ''}
                                >
                                    <span>
                                        {portal.title[language] || portal.title.en}
                                    </span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                                    </svg>
                                </a>
                            ))
                        ) : (
                            <div style={{color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontSize: '0.9rem'}}>
                                {language === 'en' ? 'New portals loading...' : 
                                 language === 'te' ? 'క్రొత్త పోర్టల్స్ లోడ్ అవుతున్నాయి...' : 
                                 'नए पोर्टल लोड हो रहे हैं...'}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
