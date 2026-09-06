'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './volunteer.module.css';
import { motion, useScroll, useSpring } from 'framer-motion';
import { fetchWithCache } from '@/utils/client-cache';
import { 
    Users, 
    Sparkles, 
    Award, 
    Compass, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck, 
    Calendar, 
    HeartHandshake, 
    Send,
    AlertCircle,
    ChevronDown,
    Cpu,
    Palette,
    Megaphone,
    Flag
} from 'lucide-react';

const departments = [
    'Computer Science & Engineering (CSE)',
    'Information Technology (IT)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering (MECH)',
    'Civil Engineering (CIVIL)',
    'Artificial Intelligence & Data Science (AI/DS)',
];

const journeyStages = [
    {
        step: '01',
        title: 'JOIN',
        subtitle: 'Enter the NSS Community',
        desc: 'Submit your profile, attend the campus induction briefing, and receive your official NSS MJCET volunteer credentials.',
        tag: 'ONBOARDING',
    },
    {
        step: '02',
        title: 'PARTICIPATE',
        subtitle: 'Mobilize on the Ground',
        desc: 'Engage actively in weekly community drives, blood donation camps, environmental initiatives, and campus awareness drives.',
        tag: 'DIRECT ACTION',
    },
    {
        step: '03',
        title: 'CONTRIBUTE',
        subtitle: 'Apply Your Core Skills',
        desc: 'Deploy your engineering aptitude across tech, design, operations, editorial, or field coordination according to your chosen wing.',
        tag: 'SKILL DEPLOYMENT',
    },
    {
        step: '04',
        title: 'LEAD',
        subtitle: 'Take Ownership of Projects',
        desc: 'Step into committee heads, drive conveners, and core team coordinators guiding hundreds of student volunteers.',
        tag: 'RESPONSIBILITY',
    },
    {
        step: '05',
        title: 'IMPACT',
        subtitle: 'Transform Society & Self',
        desc: 'Earn recognized university certification, cultivate lifelong empathy, and create measurable social progress across Telangana.',
        tag: 'LEGACY',
    },
];

const whyNssPoints = [
    {
        title: 'SERVICE',
        subtitle: 'Beyond Yourself',
        desc: 'Learn to put the community before individual gain. Develop true social empathy and purpose-driven character.',
        accent: '#FF9933',
    },
    {
        title: 'COMMUNITY',
        subtitle: 'A Lifelong Brotherhood',
        desc: 'Work shoulder-to-shoulder with hundreds of engineering peers, esteemed faculty mentors, and public civic bodies.',
        accent: '#2563eb',
    },
    {
        title: 'LEADERSHIP',
        subtitle: 'Real Responsibility',
        desc: 'Manage budgets, coordinate high-stakes logistics, and lead large teams—skills that classroom lectures can never teach.',
        accent: '#138808',
    },
    {
        title: 'EXPERIENCE',
        subtitle: 'Prestige & Scale',
        desc: 'From 7-day rural immersion camps to state-level MUN conferences and mega blood donation camps saving hundreds of lives.',
        accent: '#ea580c',
    },
    {
        title: 'IMPACT',
        subtitle: 'Documented & Certified',
        desc: 'Official NSS Certification recognized by Osmania University and the Ministry of Youth Affairs and Sports, Government of India.',
        accent: '#0d9488',
    },
];

const authenticStories = [
    {
        name: 'Mohammed Ayan',
        role: 'Volunteer • CSE 3rd Year',
        quote: 'Volunteering with NSS gave my engineering education real purpose. Organising the mega blood drive and seeing 300+ units donated was unforgettable.',
        avatar: '/uploads/nss-logo.png',
        tag: 'Blood Donation Wing',
    },
    {
        name: 'Syed Rehan',
        role: 'Lead Coordinator • IT 4th Year',
        quote: 'Leading the rural immersion camp taught me more about project management, humility, and crisis handling than any internship could.',
        avatar: '/uploads/nss-logo.png',
        tag: 'Rural Camp Secretariat',
    },
    {
        name: 'Syeda Fatima',
        role: 'Design & Media Lead • ECE 3rd Year',
        quote: 'NSS is a family where your creativity actually changes things. Every poster and teaser we produced brought hundreds of students to the drives.',
        avatar: '/uploads/nss-logo.png',
        tag: 'Creative Wing',
    },
];

export default function VolunteerPortal() {
    const { language } = useLanguage();

    const [stats, setStats] = useState({
        volunteers: 500,
        events: 50,
        serviceHours: 10000,
        beneficiaries: 50000,
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        rollNumber: '',
        department: '',
        year: '',
        interests: [],
        message: '',
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    // Scroll progress for the service thread
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });
    const threadScale = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Service in Motion Gallery Items (Configured in Admin or fallback)
    const [galleryItems, setGalleryItems] = useState([
        { title: 'Campus Induction & Assemblies', subtitle: 'Welcoming 250+ engineering student volunteers', image: '/uploads/nss-team-hero.jpg' },
        { title: 'Mega Blood Donation Drives', subtitle: '300+ units collected for Red Cross', image: '/uploads/events/1772212213205-20251110130725.jpg' },
        { title: 'Rural Immersion & Healthcare', subtitle: 'Transforming village communities', image: '/uploads/events/1772212213224-20251110145020.jpg' },
        { title: 'Awareness & Civic Drives', subtitle: 'Traffic, cyber safety, and health rallies', image: '/uploads/events/1772212567791-NSS01-3.jpg' },
        { title: 'Flagship Summits (MUNX NSS)', subtitle: 'National student diplomatic assemblies', image: '/uploads/events/1772258937302-DSC90851.jpg' },
    ]);

    // Fetch verified impact statistics from database
    useEffect(() => {
        fetchWithCache('/api/stats')
            .then(data => {
                if (data && !data.error) {
                    setStats({
                        volunteers: data.volunteers || 500,
                        events: data.events || 50,
                        serviceHours: data.serviceHours || 10000,
                        beneficiaries: data.beneficiaries || 50000,
                    });
                }
            })
            .catch(() => {});

        // Fetch custom configured Service in Motion gallery from admin content
        fetchWithCache('/api/content?pageId=volunteer_gallery')
            .then(data => {
                if (data && data.content && Array.isArray(data.content.sections) && data.content.sections.length > 0) {
                    const mapped = data.content.sections.slice(0, 5).map((sec, idx) => {
                        const titleText = typeof sec.title === 'object' ? (sec.title?.en || '') : (sec.title || '');
                        const subText = typeof sec.subtitle === 'object' ? (sec.subtitle?.en || '') : (sec.subtitle || '');
                        return {
                            title: titleText || `Service Initiative 0${idx + 1}`,
                            subtitle: subText || 'Documented community drive',
                            image: sec.image || '/uploads/nss-team-hero.jpg'
                        };
                    });
                    if (mapped.length > 0) {
                        setGalleryItems(prev => mapped.concat(prev.slice(mapped.length)).slice(0, 5));
                    }
                }
            })
            .catch(() => {});
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const scrollToForm = () => {
        const elem = document.getElementById('register-form');
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToWhyNss = () => {
        const elem = document.getElementById('why-nss');
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/volunteer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ 
                    type: 'success', 
                    message: 'Welcome to NSS MJCET! Your volunteer application has been recorded. The Secretariat will contact you for the campus induction briefing.' 
                });
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    rollNumber: '',
                    department: '',
                    year: '',
                    interests: [],
                    message: '',
                });
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to submit. Please check your information.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Unable to connect to registration server. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.portalWrapper} ref={containerRef}>
            {/* 1. HERO SECTION */}
            <section className={styles.heroSection}>
                <div className="container">
                    <div className={styles.heroGrid}>
                        {/* Left narrative */}
                        <motion.div 
                            className={styles.heroTextCol}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className={styles.heroTopBadges}>
                                <div className={styles.officialPill}>
                                    <Sparkles size={13} style={{ color: '#FF9933' }} />
                                    <span>NATIONAL SERVICE SCHEME • MJCET</span>
                                </div>
                                <div className={styles.recruitmentStatusBadge}>
                                    <span className={styles.statusDotLive} />
                                    <span>RECRUITMENT 2026–27 • OPEN</span>
                                </div>
                            </div>

                            <h1 className={styles.heroMotto}>
                                <span className={styles.heroMottoLine1}>NOT ME.</span>
                                <span className={styles.heroMottoLine2}>BUT YOU.</span>
                            </h1>

                            <h2 className={styles.heroHeadline}>
                                Start Your Journey of Service.
                            </h2>

                            <p className={styles.heroLead}>
                                Join NSS MJCET and become part of a premier student community committed to selfless service, youth leadership, community development, and meaningful on-ground action.
                            </p>

                            <div className={styles.heroActions}>
                                <button type="button" onClick={scrollToForm} className="marvelous-btn marvelous-btn-primary marvelous-btn-lg">
                                    <span>Become a Volunteer</span>
                                    <ArrowRight size={18} />
                                </button>
                                <button type="button" onClick={scrollToWhyNss} className="marvelous-btn marvelous-btn-outline marvelous-btn-lg">
                                    <span>Why NSS?</span>
                                    <ChevronDown size={18} />
                                </button>
                            </div>

                            {/* Service Thread Anchor Label */}
                            <div className={styles.threadStartBadge}>
                                <span className={styles.threadDot} />
                                <span>THE VOLUNTEER SERVICE JOURNEY BEGINS HERE</span>
                            </div>
                        </motion.div>

                        {/* Right Hero Showcase Visual Card (Real NSS Photography) */}
                        <motion.div 
                            className={styles.heroVisualCol}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                        >
                            <div className={styles.heroPhotoFrame}>
                                <div className={styles.heroPhotoWrap}>
                                    <Image
                                        src="/uploads/nss-team-hero.jpg"
                                        alt="NSS MJCET Volunteers in Action"
                                        fill
                                        priority
                                        className={styles.heroPhotoImg}
                                        style={{ objectFit: 'cover', objectPosition: 'center center' }}
                                    />
                                </div>

                                {/* Floating emblem badge */}
                                <div className={styles.heroPhotoBadge}>
                                    <Image
                                        src="/uploads/nss-logo.png"
                                        alt="NSS Emblem"
                                        width={56}
                                        height={56}
                                    />
                                    <div>
                                        <strong>MJCET UNIT</strong>
                                        <small>Osmania University</small>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. VERIFIED IMPACT METRICS STRIP */}
            <section className={styles.impactStripSection}>
                <div className="container">
                    <div className={styles.impactGrid}>
                        <div className={styles.impactItem}>
                            <div className={styles.impactNumber}>{stats.volunteers}+</div>
                            <div className={styles.impactLabel}>Active Volunteers</div>
                            <div className={styles.impactSub}>Dedicated engineering students</div>
                        </div>
                        <div className={styles.impactDivider} />

                        <div className={styles.impactItem}>
                            <div className={styles.impactNumber}>{stats.events}+</div>
                            <div className={styles.impactLabel}>Community Drives</div>
                            <div className={styles.impactSub}>On-ground initiatives executed</div>
                        </div>
                        <div className={styles.impactDivider} />

                        <div className={styles.impactItem}>
                            <div className={styles.impactNumber}>{stats.serviceHours}+</div>
                            <div className={styles.impactLabel}>Service Hours</div>
                            <div className={styles.impactSub}>Documented community hours</div>
                        </div>
                        <div className={styles.impactDivider} />

                        <div className={styles.impactItem}>
                            <div className={styles.impactNumber}>{stats.beneficiaries}+</div>
                            <div className={styles.impactLabel}>Citizens Impacted</div>
                            <div className={styles.impactSub}>Across Telangana communities</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. "WHY NSS?" SECTION */}
            <section id="why-nss" className={styles.whySection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>FOUNDATIONAL VALUES</span>
                        <h2 className={styles.sectionHeading}>Why Choose NSS MJCET?</h2>
                        <p className={styles.sectionSub}>
                            Joining NSS is not about adding another club to your resume. It is about becoming part of something far bigger than yourself.
                        </p>
                    </div>

                    <div className={styles.whyGrid}>
                        {whyNssPoints.map((pt, idx) => (
                            <motion.div 
                                key={pt.title}
                                className={styles.whyCard}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                            >
                                <span className={styles.whyIndex}>0{idx + 1}</span>
                                <h3 className={styles.whyTitle}>{pt.title}</h3>
                                <h4 className={styles.whySubtitle}>{pt.subtitle}</h4>
                                <p className={styles.whyDesc}>{pt.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. THE SERVICE JOURNEY (5 STAGES WITH SERVICE THREAD) */}
            <section className={styles.journeySection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>THE SERVICE THREAD</span>
                        <h2 className={styles.sectionHeading}>What Does Your Volunteer Journey Look Like?</h2>
                        <p className={styles.sectionSub}>
                            Five transformative milestones that turn new student inductees into compassionate, battle-tested community leaders.
                        </p>
                    </div>

                    <div className={styles.journeyTimeline}>
                        {/* Dynamic progressive thread */}
                        <div className={styles.threadSpine}>
                            <motion.div 
                                className={styles.threadFill}
                                style={{ scaleY: threadScale }}
                            />
                        </div>

                        {journeyStages.map((st, i) => (
                            <motion.div 
                                key={st.step}
                                className={`${styles.journeyRow} ${i % 2 === 1 ? styles.journeyRowAlt : ''}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <div className={styles.journeyStepBadge}>
                                    <span>{st.step}</span>
                                </div>
                                <div className={styles.journeyContent}>
                                    <div className={styles.journeyTag}>{st.tag}</div>
                                    <h3 className={styles.journeyStageTitle}>{st.title}</h3>
                                    <h4 className={styles.journeyStageSub}>{st.subtitle}</h4>
                                    <p className={styles.journeyStageDesc}>{st.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. "SERVICE IN MOTION" (DOCUMENTARY PHOTOGRAPHY SPREAD) */}
            <section className={styles.documentarySection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>GENUINE SERVICE IN MOTION</span>
                        <h2 className={styles.sectionHeading}>Real Action. Real People. No Pretense.</h2>
                        <p className={styles.sectionSub}>
                            A glimpse into on-ground drives conducted by NSS MJCET volunteers throughout the academic calendar.
                        </p>
                    </div>

                    <div className={styles.photoMosaicGrid}>
                        {galleryItems[0] && (
                            <div className={styles.mosaicItemLarge}>
                                <Image
                                    src={galleryItems[0].image}
                                    alt={galleryItems[0].title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                <div className={styles.mosaicCaption}>
                                    <strong>{galleryItems[0].title}</strong>
                                    <span>{galleryItems[0].subtitle}</span>
                                </div>
                            </div>
                        )}

                        {galleryItems.slice(1, 5).map((item, idx) => (
                            <div key={idx} className={styles.mosaicItem}>
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                <div className={styles.mosaicCaption}>
                                    <strong>{item.title}</strong>
                                    <span>{item.subtitle}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. FLAGSHIP INITIATIVES PREVIEW */}
            <section className={styles.flagshipCalloutSection}>
                <div className="container">
                    <div className={styles.flagshipBox}>
                        <div className={styles.flagshipText}>
                            <span className={styles.flagshipPill}>SIGNATURE PLATFORMS</span>
                            <h2 className={styles.flagshipHeading}>Organize Flagship Summits</h2>
                            <p className={styles.flagshipDesc}>
                                As an NSS MJCET volunteer, you can step into the Secretariat of state and national platforms like <strong>MUNX NSS (Youth Diplomacy Summit)</strong> and the <strong>Youth Parliament (Youth Democratic Summit)</strong>.
                            </p>
                            <div className={styles.flagshipFeatures}>
                                <div>✓ 80+ Delegations Hosted</div>
                                <div>✓ Diplomatic Protocol Training</div>
                                <div>✓ High-Level Institutional Governance</div>
                            </div>
                            <Link href="/events" className="marvelous-btn marvelous-btn-primary marvelous-btn-md">
                                <span>Explore All Initiatives</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className={styles.flagshipBadgeArt}>
                            <div className={styles.flagshipArtInner}>
                                <h3>MUN x NSS</h3>
                                <p>Youth Diplomacy Summit</p>
                                <span className={styles.flagshipYear}>2026 EDITION</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. REAL STORIES FROM NSS VOLUNTEERS */}
            <section className={styles.storiesSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>STUDENT VOICES</span>
                        <h2 className={styles.sectionHeading}>Stories from the NSS MJCET Family</h2>
                        <p className={styles.sectionSub}>
                            Hear directly from volunteers and student coordinators whose lives were shaped by the service ethos.
                        </p>
                    </div>

                    <div className={styles.storiesGrid}>
                        {authenticStories.map((story) => (
                            <div key={story.name} className={styles.storyCard}>
                                <span className={styles.storyWingBadge}>{story.tag}</span>
                                <p className={styles.storyQuote}>&ldquo;{story.quote}&rdquo;</p>
                                <div className={styles.storyAuthor}>
                                    <div className={styles.storyAvatarWrap}>
                                        <Image
                                            src={story.avatar}
                                            alt={story.name}
                                            width={42}
                                            height={42}
                                        />
                                    </div>
                                    <div>
                                        <h4 className={styles.storyAuthorName}>{story.name}</h4>
                                        <span className={styles.storyAuthorRole}>{story.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9. FINAL EMOTIONAL CTA BEFORE REGISTRATION FORM */}
            <section className={styles.finalCalloutSection}>
                <div className="container">
                    <div className={styles.finalCalloutCard}>
                        <span className={styles.finalMottoBadge}>NOT ME. BUT YOU.</span>
                        <h2 className={styles.finalHeading}>Ready to Serve?</h2>
                        <p className={styles.finalSubtitle}>
                            Join NSS MJCET and become part of a proud tradition of students who choose selfless service over self.
                        </p>
                        <button type="button" onClick={scrollToForm} className="marvelous-btn marvelous-btn-primary marvelous-btn-lg">
                            <span>Fill Application Below</span>
                            <ChevronDown size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 10. HIGH-USABILITY VOLUNTEER REGISTRATION FORM */}
            <section id="register-form" className={styles.formSection}>
                <div className="container">
                    <div className={styles.formContainerCard}>
                        <div className={styles.formHeader}>
                            <span className={styles.formPreTitle}>STEP 01 — MEMBERSHIP INDUCTION</span>
                            <h2 className={styles.formTitle}>Volunteer Registration Form</h2>
                            <p className={styles.formDesc}>
                                Complete your academic information below to register with the NSS MJCET Unit. No prior social work experience is required—only sincerity and dedication.
                            </p>
                        </div>

                        {status.message && (
                            <div className={`${styles.alertBox} ${status.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                                {status.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                                <div>
                                    <strong>{status.type === 'success' ? 'Application Received' : 'Notice'}</strong>
                                    <p>{status.message}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.actualForm}>
                            <div className={styles.formGridRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.fieldLabel}>
                                        Full Name <span className={styles.reqMark}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="e.g. Mohammed Ayan"
                                        className={styles.textInput}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.fieldLabel}>
                                        College / Official Email <span className={styles.reqMark}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="e.g. student@mjcollege.ac.in"
                                        className={styles.textInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGridRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.fieldLabel}>
                                        WhatsApp / Mobile Number <span className={styles.reqMark}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="10-digit mobile number"
                                        className={styles.textInput}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.fieldLabel}>
                                        College Roll Number <span className={styles.reqMark}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        placeholder="e.g. 1604-23-733-001"
                                        className={styles.textInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGridRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.fieldLabel}>
                                        Engineering Department <span className={styles.reqMark}>*</span>
                                    </label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className={styles.selectInput}
                                    >
                                        <option value="">-- Select Your Department --</option>
                                        {departments.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.fieldLabel}>
                                        Current Academic Year <span className={styles.reqMark}>*</span>
                                    </label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className={styles.selectInput}
                                    >
                                        <option value="">-- Select Academic Year --</option>
                                        <option value="1st Year">1st Year (BE / B.Tech)</option>
                                        <option value="2nd Year">2nd Year (BE / B.Tech)</option>
                                        <option value="3rd Year">3rd Year (BE / B.Tech)</option>
                                        <option value="4th Year">4th Year (BE / B.Tech)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Areas of Interest Chips */}
                            <div className={styles.interestSection}>
                                <label className={styles.fieldLabel}>
                                    Select Your Preferred Wings / Areas of Interest (Select 1 or more)
                                </label>
                                <div className={styles.chipsContainer}>
                                    {[
                                        'Event Operations & Logistics',
                                        'Design, Media & PR',
                                        'Technology & Digital Systems',
                                        'Blood Donation & Healthcare',
                                        'Rural Community Immersion',
                                        'Environmental Protection',
                                        'MUN & Youth Diplomacy',
                                        'Content & Editorial'
                                    ].map((area) => {
                                        const isSelected = formData.interests.includes(area);
                                        return (
                                            <button
                                                key={area}
                                                type="button"
                                                className={`${styles.chipBtn} ${isSelected ? styles.chipBtnActive : ''}`}
                                                onClick={() => handleInterestToggle(area)}
                                                disabled={loading}
                                            >
                                                {isSelected && <CheckCircle2 size={14} />}
                                                <span>{area}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Statement of Motivation */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>
                                    Why do you wish to join NSS MJCET? (Optional Statement of Purpose)
                                </label>
                                <textarea
                                    name="message"
                                    rows={3}
                                    value={formData.message}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Briefly tell us about your motivation to serve, skills, or prior volunteering experiences..."
                                    className={styles.textareaInput}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="marvelous-btn marvelous-btn-primary marvelous-btn-lg"
                                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                            >
                                <Send size={18} />
                                <span>{loading ? 'Submitting Application...' : 'Submit Volunteer Application →'}</span>
                            </button>

                            <p className={styles.privacyNote}>
                                <ShieldCheck size={14} style={{ color: '#10b981' }} />
                                <span>Your contact details will only be used by the NSS MJCET Secretariat for official induction communications.</span>
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
