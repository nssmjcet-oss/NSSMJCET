'use client';

import Link from 'next/link';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './page.module.css';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import LeadershipSection from '@/components/LeadershipSection';
import GoverningBodySection from '@/components/GoverningBodySection';
import EventSlider from '@/components/EventSlider';
import EventModal from '@/components/EventModal';
import AnnouncementsSection from '@/components/AnnouncementsSection';
import DevelopersSection from '@/components/DevelopersSection';

const translations = {
    // ... (translations kept same)
    hero: {
        title: {
            en: 'NSS MJCET',
            te: 'NSS MJCET',
            hi: 'एनएसएस एमजेसीईटी',
        },
        tagline: {
            en: 'Not Me But You',
            te: 'నేను కాదు మీరు',
            hi: 'मैं नहीं बल्कि आप',
        },
        description: {
            en: 'Empowering students to serve the community and build a better tomorrow through dedicated social service.',
            te: 'అంకిత సామాజిక సేవ ద్వారా సమాజానికి సేవ చేయడానికి మరియు మంచి రేపటిని నిర్మించడానికి విద్యార్థులకు శక్తినిస్తోంది.',
            hi: 'समर्पित समाज सेवा के माध्यम से समुदाय की सेवा करने और एक बेहतर कल बनाने के लिए छात्रों को सशक्त बनाना।',
        },
        joinBtn: {
            en: 'Become a Volunteer',
            te: 'వాలంటీర్ అవ్వండి',
            hi: 'स्वयंसेवक बनें',
        },
        learnMore: {
            en: 'Learn More',
            te: 'మరింత తెలుసుకోండి',
            hi: 'अधिक जानें',
        },
    },
    stats: {
        title: {
            en: 'Our Impact',
            te: 'మా ప్రభావం',
            hi: 'हमारा प्रभाव',
        },
        volunteers: {
            en: 'Active Volunteers',
            te: 'క్రియాశీల వాలంటీర్లు',
            hi: 'सक्रिय स्वयंसेवक',
        },
        events: {
            en: 'Events Conducted',
            te: 'నిర్వహించిన కార్యక్రమాలు',
            hi: 'आयोजित कार्यक्रम',
        },
        hours: {
            en: 'Service Hours',
            te: 'సేవా గంటలు',
            hi: 'सेवा के घंटे',
        },
        beneficiaries: {
            en: 'People Benefited',
            te: 'ప్రయోజనం పొందిన వ్యక్తులు',
            hi: 'लाभान्वित लोग',
        },
    },
    announcements: {
        title: {
            en: 'Latest Announcements',
            te: 'తాజా ప్రకటనలు',
            hi: 'नवीनतम घोषणाएं',
        },
        viewAll: {
            en: 'View All Announcements',
            te: 'అన్ని ప్రకటనలను చూడండి',
            hi: 'सभी घोषणाएं देखें',
        },
    },
    events: {
        title: {
            en: 'EVENTS',
            te: 'రాబోయే కార్యక్రమాలు',
            hi: 'आगामी कार्यक्रम',
        },
        viewAll: {
            en: 'View All Events',
            te: 'అన్ని కార్యక్రమాలను చూడండి',
            hi: 'सभी कार्यक्रम देखें',
        },
    },
    motto: {
        title: {
            en: 'NSS Motto',
            te: 'NSS నినాదం',
            hi: 'एनएसएस आदर्श वाक्य',
        },
        text: {
            en: 'The motto of NSS "Not Me But You" reflects the essence of democratic living and upholds the need for selfless service and appreciation of the other person\'s point of view.',
            te: 'NSS యొక్క నినాదం "నేను కాదు మీరు" ప్రజాస్వామ్య జీవన సారాంశాన్ని ప్రతిబింబిస్తుంది మరియు నిస్వార్థ సేవ మరియు ఇతర వ్యక్తి యొక్క దృక్కోణాన్ని అభినందించే అవసరాన్ని సమర్థిస్తుంది.',
            hi: 'एनएसएस का आदर्श वाक्य "मैं नहीं बल्कि आप" लोकतांत्रिक जीवन के सार को दर्शाता है और निस्वार्थ सेवा और दूसरे व्यक्ति के दृष्टिकोण की सराहना की आवश्यकता को कायम रखता है।',
        },
    },
};

// Cinematic Reveal Variants
const dreamyReveal = {
    initial: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

export default function Home() {
    const { language } = useLanguage();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [stats, setStats] = useState({
        volunteers: 0,
        events: 0,
        serviceHours: 0,
        beneficiaries: 0
    });
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data);
            })
            .catch(console.error);
    }, []);

    return (
        <div className={styles.home} data-language={language}>
            {/* Global Scroll Progress Bar */}
            <motion.div className={styles.progressBar} style={{ scaleX }} />

            <div className={styles.ornament1} />
            <div className={styles.ornament2} />
            <div className={styles.ornament3} />

            {/* 1. Hero Section */}
            <section className={styles.hero}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div
                        className={styles.heroContent}
                        initial="initial"
                        animate="animate"
                        variants={{
                            initial: { opacity: 0 },
                            animate: {
                                opacity: 1,
                                transition: { staggerChildren: 0.15, delayChildren: 0.3 }
                            }
                        }}
                    >
                        <motion.span
                            className={styles.heroTagline}
                            variants={dreamyReveal}
                        >
                            {getText(translations.hero.tagline, language)}
                        </motion.span>
                        <motion.h1
                            className={styles.heroTitle}
                            variants={dreamyReveal}
                        >
                            {getText(translations.hero.title, language)}
                        </motion.h1>
                        <motion.p
                            className={styles.heroDescription}
                            variants={dreamyReveal}
                        >
                            {getText(translations.hero.description, language)}
                        </motion.p>
                        <motion.div
                            className={styles.heroActions}
                            variants={dreamyReveal}
                            style={{ gap: '1rem', marginTop: '1.25rem' }}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/volunteer" className="marvelous-btn marvelous-btn-primary marvelous-btn-lg">
                                    {getText(translations.hero.joinBtn, language)}
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/about" className="marvelous-btn marvelous-btn-outline marvelous-btn-lg">
                                    {getText(translations.hero.learnMore, language)}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Inspiration Section (Gandhi, Vivekananda, Ambedkar + NSS Motto) */}
            <MottoSection language={language} variants={dreamyReveal} />

            {/* 3. Leadership Section (Advisor cum Director, Chairman & Program Officer) */}
            <LeadershipSection />

            {/* 4. Governing Body Section */}
            <GoverningBodySection />

            {/* 4. EVENTS (Slider) */}
            <EventSlider onViewDetails={setSelectedEvent} />

            {/* 5. Announcements */}
            <AnnouncementsSection />

            {/* 6. Our Impact (Stats) */}
            <section className={styles.stats}>
                <div className="container">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            animate: { transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        <motion.div className={styles.statsSectionLabel} variants={dreamyReveal}>
                            <span>Our Impact</span>
                        </motion.div>
                        <motion.h2 className={styles.sectionTitle} variants={dreamyReveal}>
                            {getText(translations.stats.title, language)}
                        </motion.h2>
                        <div className={styles.statsGrid}>
                            <StatCard
                                number={stats.volunteers}
                                label={getText(translations.stats.volunteers, language)}
                                suffix={stats.volunteers > 0 ? "+" : ""}
                                variants={dreamyReveal}
                            />
                            <StatCard
                                number={stats.events}
                                label={getText(translations.stats.events, language)}
                                suffix={stats.events > 0 ? "+" : ""}
                                variants={dreamyReveal}
                            />
                            <StatCard
                                number={stats.serviceHours}
                                label={getText(translations.stats.hours, language)}
                                suffix="+"
                                variants={dreamyReveal}
                            />
                            <StatCard
                                number={stats.beneficiaries}
                                label={getText(translations.stats.beneficiaries, language)}
                                suffix="+"
                                variants={dreamyReveal}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Meet The Developers */}
            <DevelopersSection />

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className="container">
                    <motion.div
                        className={styles.ctaContent}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>
                            {getText({
                                en: 'Ready to Make a Difference?',
                                te: 'మార్పు తీసుకురావడానికి సిద్ధంగా ఉన్నారా?',
                                hi: 'क्या आप बदलाव लाने के लिए तैयार हैं?'
                            }, language)}
                        </h2>
                        <p>
                            {getText({
                                en: 'Join NSS MJCET and be part of a community dedicated to social service and development.',
                                te: 'NSS MJCET లో చేరండి మరియు సామాజిక సేవ మరియు అభివృద్ధికి అంకితమైన సమాజంలో భాగం అవ్వండి.',
                                hi: 'एनएसएस एमजेसीईटी में शामिल हों और समाज सेवा और विकास के लिए समर्पित समुदाय का हिस्सा बनें।'
                            }, language)}
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ marginTop: '2.5rem' }}
                        >
                            <Link href="/volunteer" className="marvelous-btn marvelous-btn-primary marvelous-btn-lg">
                                {getText(translations.hero.joinBtn, language)}
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Event Details Modal */}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
}

function MottoSection({ language, variants }) {
    const inspirers = [
        {
            name: 'Mahatma Gandhi',
            image: '/uploads/gandhi.jpg',
            title: 'Father of the Nation',
        },
        {
            name: 'Swami Vivekananda',
            image: '/uploads/swamivivekananda.jpg',
            title: 'Spiritual Leader',
        },
        {
            name: 'Dr. B.R. Ambedkar',
            image: '/uploads/ambedkar.jpg',
            title: 'Architect of Constitution',
        },
    ];

    return (
        <section className={styles.motto}>
            <div className={styles.inspirersGrid}>
                {inspirers.map((person, idx) => (
                    <motion.div
                        key={person.name}
                        className={styles.inspireCard}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, delay: idx * 0.15 }}
                        whileHover={{ scale: 1.03, y: -6 }}
                    >
                        <div className={styles.inspireImgWrap}>
                            <img src={person.image} alt={person.name} className={styles.inspireImg} />
                        </div>
                        <div className={styles.inspireInfo}>
                            <h3 className={styles.inspireName}>{person.name}</h3>
                            <p className={styles.inspireTitle}>{person.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className={styles.mottoTextBlock}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <p className={styles.mottoText}>
                    {getText({
                        en: 'The motto of NSS "Not Me But You" reflects the essence of democratic living and upholds the need for selfless service and appreciation of the other person\'s point of view.',
                        te: 'NSS యొక్క నినాదం "నేను కాదు మీరు" ప్రజాస్వామ్య జీవన సారాంశాన్ని ప్రతిబింబిస్తుంది మరియు నిస్వార్థ సేవ మరియు ఇతర వ్యక్తి యొక్క దృక్కోణాన్ని అభినందించే అవసరాన్ని సమర్థిస్తుంది.',
                        hi: 'एनएसएस का आदर्श वाक्य "मैं नहीं बल्कि आप" लोकतांत्रिक जीवन के सार को दर्शाता है और निस्वार्थ सेवा और दूसरे व्यक्ति के दृष्टिकोण की सराहना की आवश्यकता को कायम रखता है।'
                    }, language)}
                </p>
            </motion.div>
        </section>
    );
}


function StatCard({ number, label, suffix, variants }) {
    return (
        <motion.div
            className={styles.statCard}
            variants={variants}
        >
            <div className={styles.statNumber}>
                <Counter from={0} to={number} />{suffix}
            </div>
            <div className={styles.statLabel}>{label}</div>
        </motion.div>
    );
}

function Counter({ from, to }) {
    const [count, setCount] = useState(from);

    useEffect(() => {
        const controls = { cancelled: false };
        const duration = 2000; // ms
        const startTime = Date.now();

        const animate = () => {
            if (controls.cancelled) return;
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3); // cubic ease out

            setCount(Math.floor(from + (to - from) * easeOut));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        return () => { controls.cancelled = true; };
    }, [from, to]);

    return <span>{count.toLocaleString()}</span>;
}
