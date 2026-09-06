'use client';

import { useState } from 'react';
import { useLanguage, getText } from '@/contexts/LanguageContext';
import styles from '../team.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { fetchWithCache } from '@/utils/client-cache';
import { Archive, ArrowLeft, ChevronDown, ChevronUp, Users, Calendar, Award } from 'lucide-react';

const MotionImage = motion(Image);

export default function ArchiveClient({ initialYears = [], currentYear = '2025-2026' }) {
    const { language } = useLanguage();
    const [selectedYear, setSelectedYear] = useState(null);
    const [yearData, setYearData] = useState({});
    const [loadingYear, setLoadingYear] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState('ALL');

    const filters = ['ALL', 'HR', 'PR', 'MEDIA', 'DESIGN', 'DOC', 'EVENTS', 'MARKETING', 'LOGISTICS', 'TECH'];

    const handleSelectYear = async (yr) => {
        if (selectedYear === yr) {
            setSelectedYear(null);
            return;
        }

        setSelectedYear(yr);
        setDepartmentFilter('ALL');

        if (!yearData[yr]) {
            setLoadingYear(true);
            try {
                const res = await fetchWithCache(`/api/team/archive?year=${encodeURIComponent(yr)}`);
                if (res?.members) {
                    setYearData(prev => ({ ...prev, [yr]: res.members }));
                }
            } catch (err) {
                console.error('Failed to load archive year:', err);
            } finally {
                setLoadingYear(false);
            }
        }
    };

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

    const currentMembers = selectedYear && yearData[selectedYear] ? yearData[selectedYear] : [];
    const gbsMembers = currentMembers.filter(m => m.role === 'GB');
    const execomMembers = currentMembers.filter(m => m.role === 'Execom').filter(m => matchesFilter(m, departmentFilter));
    const coreMembers = currentMembers.filter(m => m.role === 'Core').filter(m => matchesFilter(m, departmentFilter));

    return (
        <div className={styles.teamPage}>
            <div className="container">
                {/* Header Section */}
                <div style={{ paddingTop: '40px', paddingBottom: '20px', textAlign: 'center' }}>
                    <Link
                        href="/team"
                        className="marvelous-btn marvelous-btn-outline marvelous-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Current Team</span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#FF9933', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>
                        <Archive size={16} />
                        <span>NSS MJCET Historical Archive</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '900', color: '#fff', marginBottom: '16px' }}>
                        Previous NSS Teams
                    </h1>

                    <p style={{ maxWidth: '650px', margin: '0 auto', color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', lineHeight: '1.6' }}>
                        A permanent record honoring every student leader, executive officer, and core volunteer who served the community through NSS MJCET.
                    </p>
                </div>

                {/* Academic Years Selector List */}
                <div style={{ maxWidth: '800px', margin: '32px auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {initialYears.map((sess) => {
                        const isSelected = selectedYear === sess.academicYear;
                        const isCurrent = sess.status === 'current';

                        return (
                            <div
                                key={sess.academicYear}
                                style={{
                                    borderRadius: '20px',
                                    border: isSelected ? '1px solid #FF9933' : '1px solid rgba(255, 255, 255, 0.1)',
                                    background: isSelected ? 'rgba(255, 153, 51, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div
                                    onClick={() => handleSelectYear(sess.academicYear)}
                                    style={{
                                        padding: '20px 24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: isCurrent ? 'linear-gradient(135deg, #FF9933, #128807)' : 'rgba(255, 255, 255, 0.06)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff'
                                        }}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                                                    Session {sess.academicYear}
                                                </h3>
                                                {isCurrent && (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        background: 'rgba(18, 136, 7, 0.25)',
                                                        color: '#4ade80',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase'
                                                    }}>Current</span>
                                                )}
                                            </div>
                                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                                {sess.memberCount > 0 ? `${sess.memberCount} Team Members` : 'NSS Leaders & Volunteers'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className={isSelected ? "marvelous-btn marvelous-btn-primary marvelous-btn-sm" : "marvelous-btn marvelous-btn-outline marvelous-btn-sm"}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <span>{isSelected ? 'Hide Team' : 'View Team'}</span>
                                        {isSelected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>

                                {/* Expanded Team Content for Selected Year */}
                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px 20px' }}
                                        >
                                            {loadingYear ? (
                                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.7)' }}>
                                                    <div className="spinner" style={{ margin: '0 auto 16px' }} />
                                                    <p>Loading {sess.academicYear} members...</p>
                                                </div>
                                            ) : currentMembers.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'rgba(255,255,255,0.5)' }}>
                                                    No archived member records found for {sess.academicYear}.
                                                </div>
                                            ) : (
                                                <div>
                                                    {/* Department Filter Bar */}
                                                    <div className={styles.filterContainer} style={{ marginBottom: '24px' }}>
                                                        {filters.map((f) => (
                                                            <button
                                                                key={f}
                                                                className={`${styles.filterBtn} ${departmentFilter === f ? styles.filterBtnActive : ''}`}
                                                                onClick={() => setDepartmentFilter(f)}
                                                            >
                                                                {f}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Governing Body */}
                                                    {gbsMembers.length > 0 && (
                                                        <div style={{ marginBottom: '36px' }}>
                                                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#FF9933', marginBottom: '16px' }}>
                                                                Governing Body
                                                            </h4>
                                                            <div className={styles.teamGrid}>
                                                                {gbsMembers.map((m) => (
                                                                    <ArchiveMemberCard key={m.id || m._id} member={m} type="GB" language={language} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Executive Committee */}
                                                    {execomMembers.length > 0 && (
                                                        <div style={{ marginBottom: '36px' }}>
                                                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#60a5fa', marginBottom: '16px' }}>
                                                                Executive Committee
                                                            </h4>
                                                            <div className={styles.teamGrid}>
                                                                {execomMembers.map((m) => (
                                                                    <ArchiveMemberCard key={m.id || m._id} member={m} type="Execom" language={language} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Core Team */}
                                                    {coreMembers.length > 0 && (
                                                        <div>
                                                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#4ade80', marginBottom: '16px' }}>
                                                                Core Team
                                                            </h4>
                                                            <div className={styles.teamGrid}>
                                                                {coreMembers.map((m) => (
                                                                    <ArchiveMemberCard key={m.id || m._id} member={m} type="Core" language={language} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ArchiveMemberCard({ member, type, language }) {
    const nameStr = typeof member.name === 'object' ? (member.name[language] || member.name.en || '') : (member.name || '');
    const positionStr = typeof member.position === 'object' ? (member.position[language] || member.position.en || '') : (member.position || '');
    const initials = nameStr.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const cardClass = `${styles.memberBox} ${
        type === 'GB' ? styles.cardGb : type === 'Execom' ? styles.cardExecom : styles.cardCore
    }`;

    const avatarClass = `${styles.memberAvatar} ${
        type === 'GB' ? styles.avatarGb : type === 'Execom' ? styles.avatarExecom : styles.avatarCore
    }`;

    return (
        <div className={cardClass}>
            <div className={avatarClass}>
                {member.image ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                        <MotionImage
                            src={member.image}
                            alt={nameStr}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'cover', objectPosition: 'top center' }}
                            loading="lazy"
                            unoptimized={typeof member.image === 'string' && member.image.startsWith('data:')}
                            className={styles.memberImage}
                        />
                    </div>
                ) : (
                    <div className={styles.avatarPlaceholder}>{initials}</div>
                )}
            </div>

            <div className={styles.memberInfo}>
                <h3>{nameStr}</h3>
                {positionStr && <p className={styles.position}>{positionStr}</p>}
                {member.linkedin && (
                    <div className={styles.socialLinks}>
                        <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            aria-label="LinkedIn Profile"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
