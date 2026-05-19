'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './team.module.css';
import { motion } from 'framer-motion';

const translations = {
    en: {
        title: 'Our Team',
        subtitle: 'Meet the NSS MJCET Team',
        gbs: 'Governing Body',
        gbsSubtitle: 'The pillars of NSS MJCET — steering our mission with authority, wisdom, and unwavering commitment to society.',
        execom: 'Executive Committee',
        execomSubtitle: 'The execution force behind every initiative — translating vision into action, and passion into impact.',

        core: 'Our Core Team',
        coreSubtitle: 'Meet the dedicated force driving our initiatives and carrying forward the spirit of community service.',
        noMembers: 'No team members found',
    },
    te: {
        title: 'మా టీమ్',
        subtitle: 'NSS MJCET టీమ్‌ను కలవండి',
        gbs: 'గవర్నింగ్ బాడీ',
        gbsSubtitle: 'NSS MJCET యొక్క స్తంభాలు — అధికారం, జ్ఞానం మరియు సమాజంపై అచంచలమైన నిబద్ధతతో మా మిషన్‌ను నడిపించే నాయకులు.',
        execom: 'ఎగ్జిక్యూటివ్ కమిటీ',
        execomSubtitle: 'ప్రతి చొరవ వెనక అమలు శక్తి — దృష్టిని చర్యగా మరియు అభిరుచిని ప్రభావంగా మార్చే బృందం.',

        core: 'మా కోర్ టీమ్',
        coreSubtitle: 'మా కార్యక్రమాలను ముందుకు నడిపిస్తూ, సమాజ సేవా స్ఫూర్తిని కొనసాగించే అంకితభావం గల సభ్యులను కలవండి.',
        noMembers: 'టీమ్ సభ్యులు కనుగొనబడలేదు',
    },
    hi: {
        title: 'हमारी टीम',
        subtitle: 'एनएसएस एमजेसीईटी टीम से मिलें',
        gbs: 'शासी निकाय',
        gbsSubtitle: 'NSS MJCET के स्तंभ — अधिकार, ज्ञान और समाज के प्रति अटल प्रतिबद्धता के साथ हमारे मिशन का संचालन करते हैं।',
        execom: 'कार्यकारी समिति',
        execomSubtitle: 'हर पहल के पीछे की क्रियान्वयन शक्ति — दृष्टि को कार्य में और जुनून को प्रभाव में बदलने वाली टीम।',

        core: 'हमारी कोर टीम',
        coreSubtitle: 'हमारी पहलों को आगे बढ़ाने और समाज सेवा की भावना को जीवित रखने वाले समर्पित सदस्यों से मिलें।',
        noMembers: 'कोई टीम सदस्य नहीं मिला',
    },
};

const filterQuotes = {
    HR: { en: "“Managing talent, cultivating leadership, and fostering the spirit of volunteerism.”", te: "“ప్రతిభను నిర్వహించడం, నాయకత్వాన్ని పెంపొందించడం మరియు స్వచ్ఛంద స్ఫూర్తిని పెంపొందించడం.”", hi: "“प्रतिभा का प्रबंधन, नेतृत्व का विकास और स्वयंसेवा की भावना को बढ़ावा देना।”" },
    MEDIA: { en: "“Capturing moments, telling stories, and bringing our social impact to life.”", te: "“క్షణాలను బంధించడం, కథలు చెప్పడం మరియు మా సామాజిక ప్రభావాన్ని సజీవం చేయడం.”", hi: "“क्षणों को कैद करना, कहानियां सुनाना और हमारे सामाजिक प्रभाव को जीवंत करना।”" },
    DESIGN: { en: "“Visualizing change, crafting identity, and designing experiences that inspire action.”", te: "“మార్పును ఊహించడం, గుర్తింపును రూపొందించడం మరియు చర్యను ప్రేరేపించే అనుభవాలను రూపొందించడం.”", hi: "“बदलाव की कल्पना करना, पहचान बनाना और ऐसे अनुभवों को डिजाइन करना जो कार्रवाई को प्रेरित करें।”" },
    DOC: { en: "“Recording milestones, writing history, and preserving our legacy of selfless service.”", te: "“మైలురాళ్లను రికార్డ్ చేయడం, చరిత్ర రాయడం మరియు నిస్వార్థ సేవ యొక్క మా వారసత్వాన్ని కాపాడటం.”", hi: "“मील के पत्थर दर्ज करना, इतिहास लिखना और निस्वार्थ सेवा की हमारी विरासत को संजोना।”" },
    EVENTS: { en: "“Creating opportunities, orchestrating action, and transforming ideas into execution.”", te: "“అవకాశాలను సృష్టించడం, చర్యను ఆర్కెస్ట్రేట్ చేయడం మరియు ఆలోచనలను అమలులోకి మార్చడం.”", hi: "“अवसर पैदा करना, कार्रवाई को व्यवस्थित करना और विचारों को क्रियान्वयन में बदलना।”" },
    MARKETING: { en: "“Amplifying voices, building connections, and driving our mission to the world.”", te: "“స్వరాలను విస్తరించడం, కనెక్షన్‌లను నిర్మించడం మరియు ప్రపంచానికి మా మిషన్‌ను నడపడం.”", hi: "“आवाज़ों को बुलंद करना, संबंध बनाना और दुनिया में हमारे मिशन को आगे बढ़ना।”" },
    PR: { en: "“Fostering relationships, building trust, and connecting communities for social good.”", te: "“సంబంధాలను పెంపొжденచడం, నమ్మకాన్ని నిర్మించడం మరియు సామాజిక మంచి కోసం సంఘాలను అనుసంధానించడం.”", hi: "“संबंधों को बढ़ावा देना, विश्वास का निर्माण करना और सामाजिक भलाई के लिए समुदायों को जोड़ना।”" },
    LOGISTICS: { en: "“Managing execution, coordinating operations, and making every initiative seamless.”", te: "“అమలును నిర్వహించడం, కార్యకలాపాలను సమన్వయం చేయడం మరియు ప్రతి చొరవను అతుకులు లేకుండా చేయడం.”", hi: "“क्रियान्वयन का प्रबंधन, संचालन का समन्वय और हर पहल को निर्बाध बनाना।”" },
    TECH: { en: "“Coding for change, building platforms, and empowering social service through technology.”", te: "“మార్పు కోసం కోడింగ్, ప్లాట్‌ఫారమ్‌లను నిర్మించడం మరియు సాంకేతికత ద్వారా సామాజిక సేవను బలోపేతం చేయడం.”", hi: "“बदलाव के लिए कोडिंग, प्लेटफॉर्म बनाना और तकनीक के माध्यम से समाज सेवा को सशक्त बनाना।”" }
};

export default function TeamClient({ members }) {
    const { language } = useLanguage();
    const t = translations[language];

    const [execomFilter, setExecomFilter] = useState('ALL');
    const [coreFilter, setCoreFilter] = useState('ALL');
    const [selectedYear, setSelectedYear] = useState('2025-2026'); // Default to 2025-2026 as requested

    const filters = ['ALL', 'HR', 'PR', 'MEDIA', 'DESIGN', 'DOC', 'EVENTS', 'MARKETING', 'LOGISTICS', 'TECH'];

    // Only show years that have actual members, plus always include 2025-2026
    const academicYears = Array.from(
        new Set([
            '2025-2026',
            ...members.map(m => m.academicYear).filter(Boolean)
        ])
    ).sort((a, b) => b.localeCompare(a));

    const matchesFilter = (member, filter) => {
        if (filter === 'ALL') return true;
        const pos = (typeof member.position === 'object' ? (member.position.en || '') : (member.position || '')).toLowerCase();
        
        switch (filter) {
            case 'HR':
                return pos.includes('human resources') || pos.includes('hr');
            case 'MEDIA':
                return pos.includes('media');
            case 'DESIGN':
                return pos.includes('design');
            case 'DOC':
                return pos.includes('documentation') || pos.includes('doc');
            case 'EVENTS':
                return pos.includes('event');
            case 'LOGISTICS':
                return pos.includes('logistics');
            case 'MARKETING':
                return pos.includes('marketing');
            case 'TECH':
                return pos.includes('tech') || pos.includes('web master') || pos.includes('web');
            case 'PR':
                return pos.includes('public relation') || pos.includes('pr');
            default:
                return false;
        }
    };

    // Filter members first by Year (defaulting missing fields to 2025-2026)
    const yearMembers = members.filter(m => (m.academicYear || '2025-2026') === selectedYear);

    const gbsMembers = yearMembers.filter(m => m.role === 'GB');
    const execomMembers = yearMembers.filter(m => m.role === 'Execom');
    const coreMembers = yearMembers.filter(m => m.role === 'Core');

    const filteredExecom = execomMembers.filter(m => matchesFilter(m, execomFilter));
    const filteredCore = coreMembers.filter(m => matchesFilter(m, coreFilter));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03 // Even faster stagger
            }
        }
    };

    return (
        <div className={styles.teamPage}>

            <div className="container">
                {/* Elegant Dynamic Year Slider */}
                <motion.div
                    className={styles.yearSliderContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >

                    <div className={styles.yearSlider}>
                        {academicYears.map((year) => (
                            <button
                                key={year}
                                className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ''}`}
                                onClick={() => {
                                    setSelectedYear(year);
                                    setExecomFilter('ALL');
                                    setCoreFilter('ALL');
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {gbsMembers.length > 0 && (
                    <section className={styles.section}>
                        <motion.h2
                            className={styles.sectionTitle}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {t.gbs}
                        </motion.h2>
                        <motion.p
                            className={styles.sectionSubtitle}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            {t.gbsSubtitle}
                        </motion.p>
                        <motion.div
                            className={styles.teamGrid}
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {gbsMembers.map((member, idx) => (
                                <MemberCard key={member._id} member={member} priority={idx < 4} type="GB" />
                            ))}
                        </motion.div>
                    </section>
                )}

                {execomMembers.length > 0 && (
                    <section className={styles.section}>
                        <motion.h2
                            className={styles.sectionTitle}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {t.execom}
                        </motion.h2>
                        <motion.p
                            className={styles.sectionSubtitle}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            {t.execomSubtitle}
                        </motion.p>

                        {/* Separate Department Filter Bar for Execom */}
                        <div className={styles.filterContainer}>
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    className={`${styles.filterBtn} ${execomFilter === filter ? styles.filterBtnActive : ''}`}
                                    onClick={() => setExecomFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Active Filter Announcement Banner for Execom */}
                        {execomFilter !== 'ALL' && filterQuotes[execomFilter] && (
                            <div className={styles.filterBanner}>
                                <div className={styles.filterQuoteTitle}>
                                    <span style={{ textTransform: 'uppercase', color: '#FF9933' }}>{execomFilter}</span>
                                </div>
                                <p className={styles.filterQuoteText}>
                                    {filterQuotes[execomFilter][language] || filterQuotes[execomFilter].en}
                                </p>
                            </div>
                        )}

                        {filteredExecom.length > 0 ? (
                            <motion.div
                                className={styles.teamGrid}
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {filteredExecom.map((member, idx) => (
                                    <MemberCard key={member._id} member={member} priority={idx < 4} type="Execom" />
                                ))}
                            </motion.div>
                        ) : (
                            <div className={styles.noMembers}>
                                <p>{t.noMembers} for the selected department</p>
                            </div>
                        )}
                    </section>
                )}

                {coreMembers.length > 0 && (
                    <section className={styles.section}>
                        <motion.h2
                            className={styles.sectionTitle}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {t.core}
                        </motion.h2>
                        <motion.p
                            className={styles.sectionSubtitle}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            {t.coreSubtitle}
                        </motion.p>

                        {/* Separate Department Filter Bar for Core */}
                        <div className={styles.filterContainer}>
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    className={`${styles.filterBtn} ${coreFilter === filter ? styles.filterBtnActive : ''}`}
                                    onClick={() => setCoreFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Active Filter Announcement Banner for Core */}
                        {coreFilter !== 'ALL' && filterQuotes[coreFilter] && (
                            <div className={styles.filterBanner}>
                                <div className={styles.filterQuoteTitle}>
                                    <span style={{ textTransform: 'uppercase', color: '#FF9933' }}>{coreFilter}</span>
                                </div>
                                <p className={styles.filterQuoteText}>
                                    {filterQuotes[coreFilter][language] || filterQuotes[coreFilter].en}
                                </p>
                            </div>
                        )}

                        {filteredCore.length > 0 ? (
                            <motion.div
                                className={styles.teamGrid}
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {filteredCore.map((member, idx) => (
                                    <MemberCard key={member._id} member={member} priority={idx < 8} type="Core" />
                                ))}
                            </motion.div>
                        ) : (
                            <div className={styles.noMembers}>
                                <p>{t.noMembers} for the selected department</p>
                            </div>
                        )}
                    </section>
                )}



                {yearMembers.length === 0 && (
                    <div className={styles.noMembers}>
                        <p>{t.noMembers}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import Image from 'next/image';

const MotionImage = motion(Image);

function MemberCard({ member, type = 'Core', compact = false, priority = false }) {
    const { language } = useLanguage();

    const nameStr = typeof member.name === 'object' ? (member.name[language] || member.name.en || '') : (member.name || '');
    const positionStr = typeof member.position === 'object' ? (member.position[language] || member.position.en || '') : (member.position || '');

    const initials = nameStr
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const cardVariants = {
        rest: {
            scale: 1,
            y: 0,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        },
        hover: {
            scale: 1.03,
            y: -10,
            boxShadow: type === 'GB' 
                ? "0 20px 48px -10px rgba(255, 153, 51, 0.28), 0 0 0 2px rgba(255, 153, 51, 0.35)"
                : type === 'Execom'
                ? "0 20px 48px -10px rgba(59, 130, 246, 0.28), 0 0 0 2px rgba(59, 130, 246, 0.35)"
                : "0 20px 48px -10px rgba(16, 185, 129, 0.28), 0 0 0 2px rgba(16, 185, 129, 0.35)",
            transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
            }
        },
        tap: {
            scale: 0.97,
            y: 0,
        }
    };

    const imageVariants = {
        rest: {
            filter: "grayscale(70%) brightness(0.88)",
            scale: 1,
        },
        hover: {
            filter: "grayscale(0%) brightness(1.03)",
            scale: 1.08,
            transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
            }
        },
        tap: {
            filter: "grayscale(0%) brightness(1.03)",
            scale: 1.08,
        }
    };

    const textVariants = {
        rest: { y: 0, opacity: 0.9 },
        hover: {
            y: -3,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const linkedinUrl = member.linkedin || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(nameStr)}`;

    const cardClass = `${styles.memberBox} ${
        type === 'GB' ? styles.cardGb : 
        type === 'Execom' ? styles.cardExecom : 
        styles.cardCore
    } ${compact ? styles.compactMemberBox : ''}`;

    const avatarClass = `${styles.memberAvatar} ${
        type === 'GB' ? styles.avatarGb :
        type === 'Execom' ? styles.avatarExecom :
        styles.avatarCore
    }`;

    return (
        <motion.div
            className={cardClass}
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
        >
            {/* Static Frame Decorations for GB, Execom, and Core */}
            {type === 'GB' && (
                <>
                    <div className={styles.gbFrame} />
                </>
            )}
            {type === 'Execom' && (
                <>
                    <div className={styles.cyberCornerDeco} />
                    <div className={styles.execomFrame} />
                </>
            )}
            {type === 'Core' && (
                <div className={styles.coreFrame} />
            )}

            <div className={avatarClass}>
                {member.image ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                        <MotionImage
                            src={member.image}
                            alt={nameStr}
                            variants={imageVariants}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'cover', objectPosition: 'top center' }}
                            priority={priority}
                            className={styles.memberImage}
                        />
                    </div>
                ) : (
                    <motion.div
                        className={styles.avatarPlaceholder}
                        variants={imageVariants}
                    >
                        {initials}
                    </motion.div>
                )}
                <div className={styles.avatarGlowOverlay} />
            </div>

            <motion.div className={styles.memberInfo} variants={textVariants}>
                <h3>{nameStr}</h3>
                {positionStr && <p className={styles.position}>{positionStr}</p>}
                
                <div className={styles.socialLinks}>
                    <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.socialLink} ${
                            type === 'GB' ? styles.socialGb :
                            type === 'Execom' ? styles.socialExecom :
                            styles.socialCore
                        }`}
                        aria-label="LinkedIn"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </a>
                    {member.github && (
                        <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialLink} ${
                                type === 'GB' ? styles.socialGb :
                                type === 'Execom' ? styles.socialExecom :
                                styles.socialCore
                            }`}
                            aria-label="GitHub"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
