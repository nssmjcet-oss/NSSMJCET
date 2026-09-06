'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './team.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { fetchWithCache } from '@/utils/client-cache';

const translations = {
    en: {
        title: 'Our Team',
        subtitle: 'Meet the Dedicated People Behind NSS MJCET',
        badge: 'THE PEOPLE',
        gbs: 'Our Governing Body',
        gbsSubtitle: 'Meet the visionary leaders who guide our organization towards excellence and innovation.',
        execom: 'Executive Committee',
        execomSubtitle: 'The execution force behind every initiative — translating vision into action.',
        core: 'Core Team',
        coreSubtitle: 'The dedicated volunteers driving our initiatives and carrying forward the spirit of community service.',
        noMembers: 'No team members found',
    },
    te: {
        title: 'మా టీమ్',
        subtitle: 'NSS MJCET వెనక ఉన్న అంకితభావం గల వ్యక్తులను కలవండి',
        badge: 'మా బృందం',
        gbs: 'మా గవర్నింగ్ బాడీ',
        gbsSubtitle: 'మా సంస్థను అత్యున్నత స్థాయికి నడిపించే దార్శనిక నాయకులు.',
        execom: 'ఎగ్జిక్యూటివ్ కమిటీ',
        execomSubtitle: 'ప్రతి చొరవ వెనక అమలు శక్తి — దృష్టిని చర్యగా మార్చే బృందం.',
        core: 'కోర్ టీమ్',
        coreSubtitle: 'మా కార్యక్రమాలను ముందుకు నడిపిస్తూ, సమాజ సేవా స్ఫూర్తిని కొనసాగించే సభ్యులు.',
        noMembers: 'టీమ్ సభ్యులు కనుగొనబడలేదు',
    },
    hi: {
        title: 'हमारी टीम',
        subtitle: 'NSS MJCET के पीछे के समर्पित लोगों से मिलें',
        badge: 'हमारे लोग',
        gbs: 'हमारा शासी निकाय',
        gbsSubtitle: 'हमारे संगठन को उत्कृष्टता और नवाचार की ओर ले जाने वाले दूरदर्शी मार्गदर्शक।',
        execom: 'कार्यकारी समिति',
        execomSubtitle: 'हर पहल के पीछे की क्रियान्वयन शक्ति — दृष्टि को कार्य में बदलने वाली टीम।',
        core: 'कोर टीम',
        coreSubtitle: 'हमारी पहलों को आगे बढ़ाने और समाज सेवा की भावना को जीवित रखने वाले समर्पित सदस्य।',
        noMembers: 'कोई टीम सदस्य नहीं मिला',
    },
};

const deptFilters = ['ALL', 'HR', 'PR', 'MEDIA', 'DESIGN', 'DOC', 'EVENTS', 'MARKETING', 'LOGISTICS', 'TECH'];

export default function TeamClient({ initialMembers = [], currentYear = '2025-2026', allYears = ['2025-2026'] }) {
    const { language } = useLanguage();
    const t = translations[language];

    const [execomFilter, setExecomFilter] = useState('ALL');
    const [coreFilter, setCoreFilter] = useState('ALL');
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [yearMembersMap, setYearMembersMap] = useState({ [currentYear]: initialMembers });
    const [loadingYear, setLoadingYear] = useState(false);

    const academicYears = Array.from(new Set([currentYear, ...allYears])).sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        if (!yearMembersMap[selectedYear]) {
            setLoadingYear(true);
            fetchWithCache(`/api/team/archive?year=${encodeURIComponent(selectedYear)}`)
                .then(data => {
                    if (data?.members) {
                        setYearMembersMap(prev => ({ ...prev, [selectedYear]: data.members }));
                    }
                })
                .catch(err => console.error('Failed to load archive year:', err))
                .finally(() => setLoadingYear(false));
        }
    }, [selectedYear, yearMembersMap]);

    const matchesFilter = (member, filter) => {
        if (filter === 'ALL') return true;
        const pos = (typeof member.position === 'object' ? (member.position.en || '') : (member.position || '')).toLowerCase();
        switch (filter) {
            case 'HR': return pos.includes('human resources') || pos.includes('hr');
            case 'MEDIA': return pos.includes('media');
            case 'DESIGN': return pos.includes('design');
            case 'DOC': return pos.includes('documentation') || pos.includes('doc');
            case 'EVENTS': return pos.includes('event');
            case 'LOGISTICS': return pos.includes('logistics');
            case 'MARKETING': return pos.includes('marketing');
            case 'TECH': return pos.includes('tech') || pos.includes('web');
            case 'PR': return pos.includes('public relation') || pos.includes('pr');
            default: return false;
        }
    };

    const currentDisplayMembers = yearMembersMap[selectedYear] || [];
    const gbsMembers = currentDisplayMembers.filter(m => m.role === 'GB');
    const execomMembers = currentDisplayMembers.filter(m => m.role === 'Execom');
    const coreMembers = currentDisplayMembers.filter(m => m.role === 'Core');

    const filteredExecom = execomMembers.filter(m => matchesFilter(m, execomFilter));
    const filteredCore = coreMembers.filter(m => matchesFilter(m, coreFilter));

    return (
        <div className={styles.teamPage}>
            <div className="container">
                {/* Academic Year Slider */}
                {academicYears.length > 1 && (
                    <motion.div
                        className={styles.yearSliderContainer}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
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
                )}

                {loadingYear && (
                    <div className={styles.loadingState}>Loading team...</div>
                )}

                {/* === GOVERNING BODY === */}
                {gbsMembers.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionLine} />
                            <div className={styles.sectionTitleGroup}>
                                <span className={styles.sectionBadge}>Leadership</span>
                                <h2 className={styles.sectionTitle}>{t.gbs}</h2>
                                <p className={styles.sectionSubtitle}>{t.gbsSubtitle}</p>
                            </div>
                            <div className={styles.sectionLine} />
                        </div>

                        <motion.div
                            className={styles.gbGrid}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
                        >
                            {gbsMembers.map((member, idx) => (
                                <MemberCard key={member._id} member={member} priority={idx < 4} tier="gb" />
                            ))}
                        </motion.div>
                    </section>
                )}

                {/* === EXECUTIVE COMMITTEE === */}
                {execomMembers.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionLine} />
                            <div className={styles.sectionTitleGroup}>
                                <span className={styles.sectionBadge}>Leadership</span>
                                <h2 className={styles.sectionTitle}>{t.execom}</h2>
                                <p className={styles.sectionSubtitle}>{t.execomSubtitle}</p>
                            </div>
                            <div className={styles.sectionLine} />
                        </div>

                        {/* Department Filter */}
                        <div className={styles.filterBar}>
                            {deptFilters.map(f => (
                                <button
                                    key={f}
                                    className={`${styles.filterChip} ${execomFilter === f ? styles.filterChipActive : ''}`}
                                    onClick={() => setExecomFilter(f)}
                                >
                                    {f === 'ALL' ? 'All Depts' : f}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="popLayout">
                            {filteredExecom.length > 0 ? (
                                <motion.div
                                    key={`execom-${execomFilter}`}
                                    className={styles.teamGrid}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {filteredExecom.map((member, idx) => (
                                        <MemberCard key={member._id} member={member} priority={idx < 4} tier="execom" />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="no-execom"
                                    className={styles.noMembers}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <p>{t.noMembers}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                )}

                {/* === CORE TEAM === */}
                {coreMembers.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionLine} />
                            <div className={styles.sectionTitleGroup}>
                                <span className={styles.sectionBadge}>Volunteers</span>
                                <h2 className={styles.sectionTitle}>{t.core}</h2>
                                <p className={styles.sectionSubtitle}>{t.coreSubtitle}</p>
                            </div>
                            <div className={styles.sectionLine} />
                        </div>

                        {/* Department Filter */}
                        <div className={styles.filterBar}>
                            {deptFilters.map(f => (
                                <button
                                    key={f}
                                    className={`${styles.filterChip} ${coreFilter === f ? styles.filterChipActive : ''}`}
                                    onClick={() => setCoreFilter(f)}
                                >
                                    {f === 'ALL' ? 'All Depts' : f}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="popLayout">
                            {filteredCore.length > 0 ? (
                                <motion.div
                                    key={`core-${coreFilter}`}
                                    className={styles.teamGrid}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {filteredCore.map((member, idx) => (
                                        <MemberCard key={member._id} member={member} priority={idx < 8} tier="core" />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="no-core"
                                    className={styles.noMembers}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <p>{t.noMembers}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                )}

            </div>
        </div>
    );
}

/* ============================================================
   MEMBER CARD — Portrait style with floating info bar at bottom
   Inspired by E-Cell MJCET but adapted for NSS light theme
   ============================================================ */
function MemberCard({ member, tier = 'core', priority = false }) {
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

    const linkedinUrl = member.linkedin || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(nameStr)}`;
    const linkedinHandle = member.linkedin
        ? `@${(member.linkedin.split('/in/')[1] || '').replace(/\//g, '').split('?')[0].substring(0, 16)}`
        : `@${nameStr.replace(/\s+/g, '_').substring(0, 14)}`;

    const tierClass = tier === 'gb' ? styles.cardGb : tier === 'execom' ? styles.cardExecom : styles.cardCore;

    return (
        <motion.div
            className={`${styles.memberCard} ${tierClass}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover="hover"
        >
            {/* Full portrait image */}
            <div className={styles.cardImageWrap}>
                {member.image ? (
                    <motion.div
                        style={{ position: 'relative', width: '100%', height: '100%' }}
                        variants={{ hover: { scale: 1.05 } }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Image
                            src={member.image}
                            alt={nameStr}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            style={{ objectFit: 'cover', objectPosition: 'top center' }}
                            priority={priority}
                            unoptimized={typeof member.image === 'string' && member.image.startsWith('data:')}
                            onError={(e) => { if (e.target) e.target.src = '/placeholder-team.jpg'; }}
                        />
                    </motion.div>
                ) : (
                    <div className={styles.cardPlaceholder}>
                        <span>{initials}</span>
                    </div>
                )}

                {/* Gradient overlay so bottom bar reads well */}
                <div className={styles.cardGradient} />

                {/* Role badge top-left for GB/Execom */}
                {(tier === 'gb' || tier === 'execom') && (
                    <div className={styles.cardRoleBadge}>
                        {tier === 'gb' ? 'GOVERNING BODY' : 'EXEC'}
                    </div>
                )}
            </div>

            {/* Floating info bar at the bottom — E-Cell style */}
            <div className={styles.cardInfoBar}>
                <div className={styles.cardInfoLeft}>
                    <div className={styles.cardAvatarThumb}>
                        {member.image ? (
                            <Image
                                src={member.image}
                                alt={nameStr}
                                fill
                                sizes="40px"
                                style={{ objectFit: 'cover', objectPosition: 'top' }}
                                unoptimized={typeof member.image === 'string' && member.image.startsWith('data:')}
                                onError={(e) => { if (e.target) e.target.src = '/placeholder-team.jpg'; }}
                            />
                        ) : (
                            <span className={styles.cardAvatarInitial}>{initials.charAt(0)}</span>
                        )}
                    </div>
                    <div className={styles.cardNameGroup}>
                        <span className={styles.cardName}>{nameStr}</span>
                        {positionStr && <span className={styles.cardPosition}>{positionStr}</span>}
                    </div>
                </div>
                <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLinkedIn}
                    aria-label={`${nameStr} on LinkedIn`}
                    onClick={e => e.stopPropagation()}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                </a>
            </div>
        </motion.div>
    );
}
