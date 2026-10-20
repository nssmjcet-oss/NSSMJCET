'use client';

import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './about.module.css';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import AboutUsSection from '@/components/AboutUsSection';
import { fetchWithCache } from '@/utils/client-cache';

const translations = {
    en: {
        title: 'About NSS',
        subtitle: 'National Service Scheme · MJCET',
        motto: 'Not Me, But You',
        intro: {
            title: 'Our Identity & Symbolism',
            text: 'The National Service Scheme (NSS) is an Indian government-sponsored public service program conducted by the Ministry of Youth Affairs and Sports. Launched in 1969, its primary objective is to develop the personality and character of student youth through voluntary community service.',
            symbol: 'The NSS symbol is based on the Wheel of the Konark Sun Temple, Odisha. It depicts the cycle of creation, preservation, and release, signifying movement in life across time and space. The 24 spokes represent 24 hours of the day, reminding volunteers to be perpetually ready in the service of the nation.',
        },
        objectives: {
            eyebrow: 'Guiding Principles',
            title: 'Strategic Objectives',
            subtext: 'Core objectives established by the Ministry of Youth Affairs & Sports to shape youth through civic action.',
            items: [
                {
                    id: '01',
                    title: 'Community Dynamics',
                    desc: 'Identify the needs and problems of the community and involve students actively in practical problem-solving.'
                },
                {
                    id: '02',
                    title: 'Social Responsibility',
                    desc: 'Develop among volunteers a profound sense of civic duty, social cohesion, and ethical responsibility.'
                },
                {
                    id: '03',
                    title: 'Practical Solutions',
                    desc: 'Apply classroom knowledge and engineering thinking to discover sustainable solutions for societal challenges.'
                },
                {
                    id: '04',
                    title: 'Democratic Living',
                    desc: 'Cultivate democratic attitudes, group living skills, and selfless sharing of communal responsibilities.'
                },
                {
                    id: '05',
                    title: 'Leadership Qualities',
                    desc: 'Acquire leadership qualities, empathy, and organizational competence through active community field work.'
                },
                {
                    id: '06',
                    title: 'National Integration',
                    desc: 'Foster national integration, communal harmony, and inclusive development across all sections of society.'
                }
            ],
        },
        mjcet: {
            title: 'NSS MJCET Chapter',
            text: 'Continuing the proud legacy of service, the NSS MJCET unit empowers engineering students to bridge technical excellence with social empathy. Through outreach, environmental drives, healthcare camps, and literacy campaigns, we nurture engineers who lead with conscience.',
        },
    },
    te: {
        title: 'NSS గురించి',
        subtitle: 'నేషనల్ సర్వీస్ స్కీమ్ · MJCET',
        motto: 'నేను కాదు మీరు',
        intro: {
            title: 'మా గుర్తింపు & చిహ్నం',
            text: 'జాతీయ సేవా పథకం (NSS) అనేది భారత ప్రభుత్వ యువజన వ్యవహారాలు మరియు క్రీడల మంత్రిత్వ శాఖ నిర్వహించే పబ్లిక్ సర్వీస్ ప్రోగ్రామ్. 1969లో ప్రారంభించబడిన దీని ప్రధాన లక్ష్యం స్వచ్ఛంద సామాజిక సేవ ద్వారా విద్యార్థుల వ్యక్తిత్వాన్ని అభివృద్ధి చేయడం.',
            symbol: 'NSS చిహ్నం ఒడిశాలోని కోణార్క్ సూర్య దేవాలయ చక్రంపై ఆధారపడి ఉంటుంది. ఇది సృష్టి, సంరక్షణ మరియు విడుదలను వర్ణిస్తుంది, ఇది సమయం మరియు స్థలం అంతటా జీవితంలో కదలికను సూచిస్తుంది.',
        },
        objectives: {
            eyebrow: 'మార్గదర్శక సూత్రాలు',
            title: 'ముఖ్య లక్ష్యాలు',
            subtext: 'సమాజ సేవ ద్వారా యువతను తీర్చిదిద్దడానికి ముఖ్య లక్ష్యాలు.',
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
                    desc: 'సమస్యలకు ఆచరణాత్మక పరిష్కారాలను కనుగొనడంలో జ్ఞానాన్ని ఉపయోగించడం.'
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
        subtitle: 'राष्ट्रीय सेवा योजना · MJCET',
        motto: 'मैं नहीं बल्कि आप',
        intro: {
            title: 'हमारी पहचान और प्रतीक',
            text: 'राष्ट्रीय सेवा योजना (एनएसएस) युवा मामले और खेल मंत्रालय द्वारा संचालित एक भारत सरकार प्रायोजित सार्वजनिक सेवा कार्यक्रम है। 1969 में शुरू किया गया, इसका प्राथमिक लक्ष्य स्वैच्छिक सामुदायिक सेवा के माध्यम से छात्र युवाओं के व्यक्तित्व का विकास करना है।',
            symbol: 'एनएसएस प्रतीक कोणार्क सूर्य मंदिर, ओडिशा के पहिये पर आधारित है। यह सृजन, संरक्षण और मुक्ति के चक्र को चित्रित करता है।',
        },
        objectives: {
            eyebrow: 'मार्गदर्शक सिद्धांत',
            title: 'रणनीतिक लक्ष्य',
            subtext: 'सामुदायिक सेवा के माध्यम से युवाओं के समग्र विकास के मुख्य उद्देश्य।',
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
    const [dynamicContent, setDynamicContent] = useState(null);
    const t = translations[language] || translations.en;

    useEffect(() => {
        fetchWithCache('/api/content?pageId=about')
            .then(data => {
                if (data?.content) setDynamicContent(data.content);
            })
            .catch(err => console.error('About fetch error:', err));
    }, []);

    // Merge logic: Use dynamic title/content if available
    const displayTitle = dynamicContent?.title?.[language] || dynamicContent?.title?.en || t.title;
    const displaySubtitle = t.subtitle;
    const displaySections = dynamicContent?.sections || [];

    return (
        <div className={styles.aboutPage}>
            {/* 1. EDITORIAL HERO SECTION */}
            <section className={styles.heroSection}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <motion.div
                            className={styles.heroEyebrow}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span>National Service Scheme · MJCET</span>
                        </motion.div>
                        <motion.h1
                            className={styles.heroTitle}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                        >
                            {displayTitle}
                        </motion.h1>
                        <motion.p
                            className={styles.heroSubtitle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            {displaySubtitle}
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* 2. EDITORIAL ABOUT US SECTION — Identity Emblem + Who We Are + Activity Cycle */}
            <AboutUsSection language={language} />

            {/* 3. STRATEGIC OBJECTIVES SECTION */}
            <section className={styles.objectivesSection}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>{t.objectives.eyebrow}</span>
                        <h2 className={styles.sectionHeading}>{t.objectives.title}</h2>
                        <p className={styles.sectionSubtext}>{t.objectives.subtext}</p>
                    </div>

                    <div className={styles.objectivesGrid}>
                        {t.objectives.items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className={styles.objectiveCard}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08, duration: 0.5 }}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardNumber}>{item.id}</span>
                                    <div className={styles.cardLine} />
                                </div>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardDesc}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. SYMBOLISM & KONARK WHEEL SECTION */}
            <section className={styles.symbolSection}>
                <div className="container">
                    <motion.div
                        className={styles.symbolCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className={styles.symbolEmblemCol}>
                            <div className={styles.symbolEmblemFrame}>
                                <Image
                                    src="/uploads/nss-logo.png"
                                    alt="NSS Crest"
                                    width={150}
                                    height={150}
                                    priority
                                />
                            </div>
                            <span className={styles.symbolBadge}>OFFICIAL EMBLEM</span>
                        </div>
                        <div className={styles.symbolContentCol}>
                            <h2 className={styles.symbolHeading}>{t.intro.title}</h2>
                            <p className={styles.symbolText}>{t.intro.text}</p>
                            <p className={styles.symbolText}>{t.intro.symbol}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 5. INSTITUTIONAL PRIDE SECTION */}
            <section className={styles.mjcetSection}>
                <div className="container">
                    <motion.div
                        className={styles.mjcetCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className={styles.mjcetIdentity}>
                            <div className={styles.mjcetLogoWrap}>
                                <Image
                                    src="/uploads/sues-logo.png"
                                    alt="MJCET Logo"
                                    width={120}
                                    height={120}
                                    priority
                                />
                            </div>
                            <span className={styles.mjcetName}>MJCET</span>
                        </div>
                        <div className={styles.mjcetContent}>
                            <h2 className={styles.mjcetTitle}>{t.mjcet.title}</h2>
                            <p className={styles.mjcetDesc}>{t.mjcet.text}</p>
                            <div className={styles.mottoPill}>
                                <span>&ldquo;{t.motto}&rdquo;</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 6. DYNAMIC SECTIONS FROM ADMIN */}
            {displaySections.length > 0 && (
                <section className={styles.objectivesSection}>
                    <div className="container">
                        {displaySections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                className={styles.objectiveCard}
                                style={{ marginBottom: '24px' }}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h3 className={styles.cardTitle}>
                                    {section.heading?.[language] || section.heading?.en}
                                </h3>
                                <p className={styles.cardDesc} style={{ whiteSpace: 'pre-wrap' }}>
                                    {section.content?.[language] || section.content?.en}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
