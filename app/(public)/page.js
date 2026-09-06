'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from './page.module.css';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import LeadershipSection from '@/components/LeadershipSection';
import FlagshipSection from '@/components/FlagshipSection';
import EventSlider from '@/components/EventSlider';
import EventsPortalBanner from '@/components/EventsPortalBanner';
import EventModal from '@/components/EventModal';
import DevelopersSection from '@/components/DevelopersSection';
import { Sparkles, ArrowRight, Camera } from 'lucide-react';
import { fetchWithCache } from '@/utils/client-cache';


const translations = {
    // ... (translations kept same)
    hero: {
        title: {
            en: 'NSS MJCET – National Service Scheme',
            te: 'NSS MJCET',
            hi: 'एनएसएस एमजेसीईटी',
        },
        tagline: {
            en: 'Not Me But You',
            te: 'నేను కాదు మీరు',
            hi: 'मैं नहीं बल्कि आप',
        },
        description: {
            en: 'NSS MJCET is the official National Service Scheme unit of Muffakham Jah College of Engineering & Technology. The platform highlights volunteer initiatives, community service programs, social impact activities, and student engagement led by NSS volunteers.',
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
    const [stats, setStats] = useState({
        volunteers: 0,
        events: 0,
        serviceHours: 0,
        beneficiaries: 0
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [heroData, setHeroData] = useState(null);
    const [flagships, setFlagships] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [liveEvent, setLiveEvent] = useState(null);

    // Fetch dynamic content on mount
    useEffect(() => {
        // Fetch stats
        fetchWithCache('/api/stats')
            .then(data => {
                if (data && !data.error) {
                    setStats({
                        volunteers: data.volunteers || 0,
                        events: data.events || 0,
                        serviceHours: data.serviceHours || 0,
                        beneficiaries: data.beneficiaries || 0
                    });
                }
            })
            .catch(console.error);

        // Fetch dynamic Hero content (photo + quick stats)
        fetchWithCache('/api/content?pageId=hero')
            .then(data => {
                if (data?.content) {
                    setHeroData(data.content);
                }
            })
            .catch(console.error);

        // Fetch flagships
        fetchWithCache('/api/flagship')
            .then(data => {
                if (data?.flagships) {
                    setFlagships(data.flagships);
                }
            })
            .catch(console.error);

        // Fetch events
        fetchWithCache('/api/events')
            .then(data => {
                const list = data?.events || (Array.isArray(data) ? data : []);
                if (list.length > 0) {
                    setAllEvents(list);
                }
            })
            .catch(console.error);

        // Fetch live spotlight event from Content model
        fetchWithCache('/api/content?pageId=live_event')
            .then(data => {
                if (data?.content) {
                    setLiveEvent(data.content);
                }
            })
            .catch(console.error);
    }, []);

    // Merge logic for dynamic hero
    const displayHeroTitle = heroData?.title?.[language] || heroData?.title?.en || getText(translations.hero.title, language);
    const displayHeroDesc = heroData?.content?.[language] || heroData?.content?.en || getText(translations.hero.description, language);

    return (
        <div className={styles.home} data-language={language}>
            {/* 1. Hero Section — Original NSS MJCET Signature Design */}
            <section className={styles.hero}>
                {/* Clean, authentic light background with subtle tricolor atmosphere */}
                <div className={styles.heroBackdrop}>
                    <div className={styles.heroGlowSaffron} />
                    <div className={styles.heroGlowGreen} />
                </div>

                <div className={`container ${styles.heroContainer}`} style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div
                        className={styles.heroGrid}
                        initial="initial"
                        animate="animate"
                        variants={{
                            initial: { opacity: 0 },
                            animate: {
                                opacity: 1,
                                transition: { staggerChildren: 0.15, delayChildren: 0.1 }
                            }
                        }}
                    >
                        {/* Left Column: Authentic Brand Narrative */}
                        <div className={styles.heroTextCol}>
                            {/* Mission Pill */}
                            <motion.div className={styles.heroBadge} variants={dreamyReveal}>
                                <span className={styles.heroBadgeDot} />
                                <span className={styles.heroBadgeText}>MUFFAKHAM JAH COLLEGE OF ENGINEERING & TECHNOLOGY</span>
                            </motion.div>

                            {/* Main Title with NSS Identity */}
                            <motion.h1 className={styles.heroHeading} variants={dreamyReveal}>
                                <span className={styles.heroHeadingSub}>NATIONAL SERVICE SCHEME</span>
                                <span className={styles.heroHeadingMain}>NSS MJCET</span>
                            </motion.h1>

                            {/* Official Motto Callout */}
                            <motion.div className={styles.heroMottoBanner} variants={dreamyReveal}>
                                <span className={styles.heroMottoQuote}>“</span>
                                <span className={styles.heroMottoText}>NOT ME BUT YOU</span>
                                <span className={styles.heroMottoQuote}>”</span>
                            </motion.div>

                            {/* Mission description */}
                            <motion.p className={styles.heroDescText} variants={dreamyReveal}>
                                Empowering students through selfless community service, leadership development,
                                and impactful social initiatives across society.
                            </motion.p>

                            {/* Action Buttons */}
                            <motion.div className={styles.heroActionButtons} variants={dreamyReveal}>
                                <Link href="/volunteer" className="marvelous-btn marvelous-btn-primary marvelous-btn-lg">
                                    Become a Volunteer
                                </Link>
                                <Link href="/about" className="marvelous-btn marvelous-btn-outline marvelous-btn-lg">
                                    Explore NSS
                                </Link>
                            </motion.div>

                            {/* Quick Stats Pill Strip */}
                            <motion.div className={styles.heroTrustStrip} variants={dreamyReveal}>
                                <div className={styles.heroTrustItem}>
                                    <strong>{heroData?.volunteers || stats.volunteers || '500'}+</strong>
                                    <span>Volunteers</span>
                                </div>
                                <div className={styles.heroTrustDivider} />
                                <div className={styles.heroTrustItem}>
                                    <strong>{heroData?.events || stats.events || '50'}+</strong>
                                    <span>Events</span>
                                </div>
                                <div className={styles.heroTrustDivider} />
                                <div className={styles.heroTrustItem}>
                                    <strong>{heroData?.serviceHours || stats.serviceHours || '10000'}+</strong>
                                    <span>Service Hrs</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Hero Team Visual Card (Original, No Dark Veil) */}
                        <motion.div className={styles.heroCardCol} variants={dreamyReveal}>
                            <div className={styles.heroCardFrame}>
                                <div className={styles.heroCardImgWrap}>
                                    <Image
                                        src={heroData?.image || '/uploads/nss-team-hero.jpg'}
                                        alt="NSS MJCET Volunteer Team"
                                        fill
                                        priority
                                        unoptimized={typeof heroData?.image === 'string' && heroData.image.startsWith('data:')}
                                        className={styles.heroCardImg}
                                        style={{ objectFit: 'cover', objectPosition: 'center center' }}
                                    />
                                    <div className={styles.heroCardImgGlow} />
                                </div>

                                {/* Floating Authentic NSS Emblem Badge */}
                                <div className={styles.heroEmblemFloat}>
                                    <Image
                                        src="/uploads/nss-logo.png"
                                        alt="NSS Emblem"
                                        width={68}
                                        height={68}
                                        priority
                                    />
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Inspiration Section (Gandhi, Vivekananda, Ambedkar + NSS Motto) */}
            <MottoSection language={language} variants={dreamyReveal} />

            {/* Featured Spotlight / Live Event Section */}
            {liveEvent && liveEvent.isActive && (
                <section className={styles.spotlightSection}>
                    <div className="container">
                        <motion.div
                            className={styles.spotlightCard}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className={styles.spotlightImageContainer}>
                                {liveEvent.image ? (
                                    <Image
                                        src={liveEvent.image}
                                        alt={liveEvent.title?.[language] || liveEvent.title?.en}
                                        width={800}
                                        height={600}
                                        className={styles.spotlightImage}
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <div className={styles.spotlightPlaceholder}>
                                        <Camera size={44} style={{ opacity: 0.2, color: 'currentColor' }} />
                                    </div>
                                )}
                            </div>
                            <div className={styles.spotlightInfoContainer}>
                                <span className={styles.spotlightHeading}>
                                    <span className={styles.liveDot} />
                                    {liveEvent.subtitle?.[language] || liveEvent.subtitle?.en || 'LIVE EVENT'}
                                </span>
                                <h2 className={styles.spotlightTitle}>
                                    {liveEvent.title?.[language] || liveEvent.title?.en}
                                </h2>
                                <p className={styles.spotlightDescription}>
                                    {liveEvent.content?.[language] || liveEvent.content?.en}
                                </p>
                                {liveEvent.btnLink && (
                                    <div className={styles.spotlightActions}>
                                        <a
                                            href={liveEvent.btnLink}
                                            target={liveEvent.btnLink.startsWith('http') ? '_blank' : '_self'}
                                            rel="noopener noreferrer"
                                            className="marvelous-btn marvelous-btn-primary marvelous-btn-lg"
                                        >
                                            {liveEvent.btnText?.[language] || liveEvent.btnText?.en || 'View Details'}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Flagship Campaigns — DB-driven portrait cards */}
            {/* 3. Flagship Initiatives — E-Cell inspired letterform hero, dynamic multi-initiative support */}
            <FlagshipSection
                flagships={flagships}
                allEvents={allEvents}
                onSelectEvent={setSelectedEvent}
            />

            {/* 4. Leadership Section (Chairman & Program Officer) */}
            <LeadershipSection />

            {/* 5. Flagship Events Portal Banner */}
            <EventsPortalBanner />

            {/* 6. EVENTS (Slider) */}
            <EventSlider onViewDetails={setSelectedEvent} />

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
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Image
                                    src={person.image}
                                    alt={person.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    style={{ objectFit: 'cover' }}
                                    className={styles.inspireImg}
                                />
                            </div>
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
