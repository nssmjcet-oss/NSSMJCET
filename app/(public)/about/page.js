'use client';

import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './about.module.css';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

const translations = {
    en: {
        title: 'About NSS',
        subtitle: 'National Service Scheme',
        motto: 'Not Me But You',
        intro: {
            title: 'Our Identity',
            text: 'The National Service Scheme (NSS) is an Indian government-sponsored public service program conducted by the Ministry of Youth Affairs and Sports. Launched in 1969, its primary objective is to develop the personality and character of student youth through voluntary community service.',
            symbol: 'The NSS symbol is based on the Wheel of the Konark Sun Temple, Odisha. It depicts the cycle of creation, preservation, and release, signifying movement in life across time and space. The wheel stands for the progressive cycle of life and service.',
        },
        objectives: {
            title: 'Strategic Objectives',
            items: [
                {
                    id: '01',
                    title: 'Community Dynamics',
                    desc: 'Identify the needs and problems of the community and involve students in problem-solving.'
                },
                {
                    id: '02',
                    title: 'Social Responsibility',
                    desc: 'Develop among themselves a sense of social and civic responsibility.'
                },
                {
                    id: '03',
                    title: 'Practical Solutions',
                    desc: 'Utilize knowledge in finding practical solutions to individual and community problems.'
                },
                {
                    id: '04',
                    title: 'Group Living',
                    desc: 'Develop competence required for group-living and sharing of responsibilities.'
                },
                {
                    id: '05',
                    title: 'Leadership Qualities',
                    desc: 'Acquire leadership qualities and democratic attitudes through community service.'
                },
                {
                    id: '06',
                    title: 'National Integration',
                    desc: 'Practice national integration and social harmony to build a stronger nation.'
                }
            ],
        },
        mjcet: {
            title: 'NSS MJCET Chapter',
            text: 'Continuing the legacy of service, NSS MJCET empowers students to become socially responsible citizens. Through outreach and innovation, we bridge the gap between education and community needs.',
        },
    },
    te: {
        title: 'NSS గురించి',
        subtitle: 'నేషనల్ సర్వీస్ స్కీమ్',
        motto: 'నేను కాదు మీరు',
        intro: {
            title: 'మా గుర్తింపు',
            text: 'జాతీయ సేవా పథకం (NSS) అనేది భారత ప్రభుత్వ యువజన వ్యవహారాలు మరియు క్రీడల మంత్రిత్వ శాఖ నిర్వహించే పబ్లిక్ సర్వీస్ ప్రోగ్రామ్. 1969లో ప్రారంభించబడిన దీని ప్రధాన లక్ష్యం స్వచ్ఛంద సామాజిక సేవ ద్వారా విద్యార్థుల వ్యక్తిత్వాన్ని మరియు స్వభావాన్ని అభివృద్ధి చేయడం.',
            symbol: 'NSS చిహ్నం ఒడిశాలోని కోణార్క్ సూర్య దేవాలయ చక్రంపై ఆధారపడి ఉంటుంది. ఇది సృష్టి, సంరక్షణ మరియు విడుదలను వర్ణిస్తుంది, ఇది సమయం మరియు స్థలం అంతటా జీవితంలో కదలికను సూచిస్తుంది.',
        },
        objectives: {
            title: 'ముఖ్య లక్ష్యాలు',
            items: [
                {
                    id: '01',
                    title: 'సామాజిక అవగాహన',
                    desc: 'సమాజం యొక్క అవసరాలను మరియు సమస్యలను గుర్తించి, వాటి పరిష్కారంలో విద్యార్థులను భాగస్వామ్యం చేయడం.'
                },
                {
                    id: '02',
                    title: 'సామాజిక బాధ్యత',
                    desc: 'విద్యార్థులలో సామాజిక మరియు పౌర బాధ్యత భావనను పెంపొందించడం.'
                },
                {
                    id: '03',
                    title: 'ఆచరణాత్మక పరిష్కారాలు',
                    desc: 'వ్యక్తిగత మరియు సామాజిక సమస్యలకు ఆచరణాత్మక పరిష్కారాలను కనుగొనడంలో జ్ఞానాన్ని ఉపయోగించడం.'
                },
                {
                    id: '04',
                    title: 'సామూహిక జీవనం',
                    desc: 'సామూహిక జీవనం మరియు బాధ్యతలను పంచుకోవడానికి అవసరమైన సామర్థ్యాన్ని అభివృద్ధి చేయడం.'
                },
                {
                    id: '05',
                    title: 'నాయకత్వ లక్షణాలు',
                    desc: 'సామాజిక సేవ ద్వారా నాయకత్వ లక్షణాలను మరియు ప్రజాస్వామ్య వైఖరిని పెంపొందించుకోవడం.'
                },
                {
                    id: '06',
                    title: 'జాతీయ సమైక్యత',
                    desc: 'బలమైన దేశ నిర్మాణం కోసం జాతీయ సమైక్యత మరియు సామాజిక సామరస్యాన్ని ఆచరించడం.'
                }
            ],
        },
        mjcet: {
            title: 'NSS MJCET విభాగం',
            text: 'సేవా వారసత్వాన్ని కొనసాగిస్తూ, NSS MJCET విద్యార్థులను బాధ్యతాయుతమైన పౌరులుగా తీర్చిదిద్దుతుంది.',
        },
    },
    hi: {
        title: 'एनएसएस के बारे में',
        subtitle: 'राष्ट्रीय सेवा योजना',
        motto: 'मैं नहीं बल्कि आप',
        intro: {
            title: 'हमारी पहचान',
            text: 'राष्ट्रीय सेवा योजना (एनएसएस) युवा मामले और खेल मंत्रालय द्वारा संचालित एक भारत सरकार प्रायोजित सार्वजनिक सेवा कार्यक्रम है। 1969 में शुरू किया गया, इसका प्राथमिक लक्ष्य स्वैच्छिक सामुदायिक सेवा के माध्यम से छात्र युवाओं के व्यक्तित्व का विकास करना है।',
            symbol: 'एनएसएस प्रतीक कोणार्क सूर्य मंदिर, ओडिशा के पहिये पर आधारित है। यह सृजन, संरक्षण और मुक्ति के चक्र को चित्रित करता है।',
        },
        objectives: {
            title: 'रणनीतिक लक्ष्य',
            items: [
                {
                    id: '01',
                    title: 'सामुदायिक गतिशीलता',
                    desc: 'समुदाय की जरूरतों को पहचानना और छात्रों को समस्या समाधान में शामिल करना।'
                },
                {
                    id: '02',
                    title: 'सामाजिक जिम्मेदारी',
                    desc: 'छात्रों के बीच सामाजिक और नागरिक जिम्मेदारी की भावना विकसित करना।'
                },
                {
                    id: '03',
                    title: 'व्यावहारिक समाधान',
                    desc: 'व्यक्तिगत और सामुदायिक समस्याओं के व्यावहारिक समाधान खोजने में ज्ञान का उपयोग करना।'
                },
                {
                    id: '04',
                    title: 'सामूहिक जीवन',
                    desc: 'सामूहिक जीवन और जिम्मेदारियों को साझा करने के लिए आवश्यक क्षमता विकसित करना।'
                },
                {
                    id: '05',
                    title: 'नेतृत्व गुण',
                    desc: 'सामुदायिक सेवा के माध्यम से नेतृत्व गुण और लोकतांत्रिक दृष्टिकोण प्राप्त करना।'
                },
                {
                    id: '06',
                    title: 'राष्ट्रीय एकता',
                    desc: 'एक मजबूत राष्ट्र के निर्माण के लिए राष्ट्रीय एकता और सामाजिक सद्भाव का अभ्यास करना।'
                }
            ],
        },
        mjcet: {
            title: 'एनएसएस एमजेसीईटी शाखा',
            text: 'सेवा की विरासत को जारी रखते हुए, एनएसएस एमजेसीईटी छात्रों को एक जिम्मेदार नागरिक बनाने में मदद करता है।',
        },
    },
};

export default function AboutPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const chakraRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    return (
        <div className={styles.aboutPage} ref={containerRef}>
            {/* 1. HERO SECTION */}
            <section className={styles.heroSection}>
                <div className={styles.tricolorOverlay} />
                <motion.div
                    className={styles.chakraWatermark}
                    style={{ rotate: chakraRotate }}
                >
                    <svg viewBox="0 0 100 100" className={styles.chakraSvg}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        {[...Array(24)].map((_, i) => (
                            <line
                                key={i}
                                x1="50" y1="50"
                                x2={50 + 45 * Math.cos((i * 15 * Math.PI) / 180)}
                                y2={50 + 45 * Math.sin((i * 15 * Math.PI) / 180)}
                                stroke="currentColor"
                                strokeWidth="0.5"
                            />
                        ))}
                    </svg>
                </motion.div>

                <div className="container">
                    <div className={styles.heroContent}>
                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {t.title}
                        </motion.h1>
                        <motion.div
                            className={styles.heroLine}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 1 }}
                        />
                        <motion.p
                            className={styles.heroSubtitle}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            {t.subtitle}
                        </motion.p>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* 2. IDENTITY CARD */}
                <motion.section
                    className={styles.introCardSection}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <div className={styles.glassCard}>
                        <div className={styles.cardLayout}>
                            <motion.div
                                className={styles.logoContainer}
                                whileHover={{ rotateY: 15, rotateX: -10, scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <div className={styles.logoBacklight} />
                                <Image
                                    src="/uploads/nss-logo (1).png"
                                    alt="NSS Logo"
                                    width={200}
                                    height={200}
                                    className={styles.nssLogo}
                                />
                            </motion.div>
                            <div className={styles.introText}>
                                <h2 className={styles.glassTitle}>{t.intro.title}</h2>
                                <p className={styles.mainDescription}>{t.intro.text}</p>
                                <div className={styles.symbolInfo}>
                                    <div className={styles.symbolTag}>SYMBOLISM</div>
                                    <p>{t.intro.symbol}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 3. OBJECTIVES GRID */}
                <section className={styles.objectivesSection}>
                    <motion.h2
                        className={styles.sectionHeading}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {t.objectives.title}
                    </motion.h2>

                    <div className={styles.objectivesGrid}>
                        {t.objectives.items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className={styles.objectiveCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.03,
                                    borderColor: index % 2 === 0 ? 'rgba(255, 153, 51, 0.4)' : 'rgba(19, 136, 8, 0.4)'
                                }}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardNumber}>{item.id}</span>
                                    <div className={styles.accentLine} />
                                </div>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardDesc}>{item.desc}</p>
                                <div className={styles.cardGlow} />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. INSTITUTIONAL PRIDE */}
                <motion.section
                    className={styles.mjcetSection}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <div className={styles.mjcetGlass}>
                        <div className={styles.mjcetLayout}>
                            <div className={styles.institutionIdentity}>
                                <motion.div
                                    className={styles.instLogoWrap}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Image
                                        src="/uploads/sues-logo.png"
                                        alt="MJCET Logo"
                                        width={140}
                                        height={140}
                                        className={styles.suesLogo}
                                        priority
                                    />
                                </motion.div>
                                <h3>MJCET</h3>
                            </div>
                            <div className={styles.mjcetContent}>
                                <h2>{t.mjcet.title}</h2>
                                <p>{t.mjcet.text}</p>
                                <div className={styles.mottoText}>{t.motto}</div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
