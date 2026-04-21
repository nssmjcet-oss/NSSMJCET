'use client';
// Force re-generation of admin dashboard

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Icons } from '@/components/Icons';
import styles from './dashboard.module.css';
import { adminFetch } from '@/utils/api-client';

const translations = {
    en: {
        welcome: 'Welcome',
        overview: 'Here\'s an overview of your admin dashboard',
        totalUsers: 'Total Users',
        totalEvents: 'Total Events',
        pendingVolunteers: 'Pending Volunteers',
        quickActions: 'Quick Actions',
        createEvent: 'Create Event',
        manageUsers: 'Manage Users',
        viewVolunteers: 'View Volunteers',
    },
    te: {
        welcome: 'స్వాగతం',
        overview: 'మీ అడ్మిన్ డాష్‌బోర్డ్ యొక్క అవలోకనం ఇక్కడ ఉంది',
        totalUsers: 'మొత్తం వినియోగదారులు',
        totalEvents: 'మొత్తం ఈవెంట్‌లు',
        pendingVolunteers: 'పెండింగ్ వాలంటీర్లు',
        quickActions: 'శీఘ్ర చర్యలు',
        createEvent: 'ఈవెంట్ సృష్టించండి',
        manageUsers: 'వినియోగదారులను నిర్వహించండి',
        viewVolunteers: 'వాలంటీర్లను చూడండి',
    },
    hi: {
        welcome: 'स्वागत है',
        overview: 'यहाँ आपके एडमिन डैशबोर्ड का अवलोकन है',
        totalUsers: 'कुल उपयोगकर्ता',
        totalEvents: 'कुल कार्यक्रम',
        pendingVolunteers: 'लंबित स्वयंसेवक',
        quickActions: 'त्वरित कार्रवाइयां',
        createEvent: 'कार्यक्रम बनाएं',
        manageUsers: 'उपयोगकर्ता प्रबंधित करें',
        viewVolunteers: 'स्वयंसेवक देखें',
    },
};

export default function AdminDashboard() {
    const { user, role } = useAuth();
    const { language } = useLanguage();
    const t = translations[language];

    const [stats, setStats] = useState({
        users: 0,
        events: 0,
        volunteers: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminFetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();
    }, []);

    const isSuperAdmin = role === 'superadmin';

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        hover: {
            scale: 1.02,
            translateY: -5,
            transition: { type: 'spring', stiffness: 400, damping: 10 }
        }
    };

    return (
        <div className={styles.dashboard}>
            <motion.div
                className={styles.welcomeSection}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h2>{t.welcome}, Admin!</h2>
                <p>{t.overview}</p>
            </motion.div>

            <div className={styles.bentoGrid}>
                {isSuperAdmin && (
                    <motion.div
                        className={styles.bentoCard}
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}><Icons.Users size={28} /></div>
                            <span className={styles.cardLabel}>{t.totalUsers}</span>
                        </div>
                        <div className={styles.cardValue}>{stats.users}</div>
                        <div className={styles.cardGlow} />
                    </motion.div>
                )}

                <motion.div
                    className={styles.bentoCard}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}><Icons.Events size={28} /></div>
                        <span className={styles.cardLabel}>{t.totalEvents}</span>
                    </div>
                    <div className={styles.cardValue}>{stats.events}</div>
                    <div className={styles.cardGlow} />
                </motion.div>

                <motion.div
                    className={styles.bentoCard}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    transition={{ delay: 0.2 }}
                >
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}><Icons.Volunteers size={28} /></div>
                        <span className={styles.cardLabel}>{t.pendingVolunteers}</span>
                    </div>
                    <div className={styles.cardValue}>{stats.volunteers}</div>
                    <div className={styles.cardGlow} />
                </motion.div>
            </div>

            <div className={styles.quickActionsSection}>
                <h3 className={styles.sectionTitle}>{t.quickActions}</h3>
                <div className={styles.actionsBento}>
                    <motion.a
                        href="/admin/events"
                        className={styles.actionBentoCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={styles.actionIconWrapper}><Icons.Events size={20} /></div>
                        <span>Manage Events</span>
                    </motion.a>
                    
                    <motion.a
                        href="/admin/governing-body"
                        className={styles.actionBentoCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={styles.actionIconWrapper}><Icons.Users size={20} /></div>
                        <span>Governing Body</span>
                    </motion.a>

                    <motion.a
                        href="/admin/volunteers"
                        className={styles.actionBentoCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={styles.actionIconWrapper}><Icons.Volunteers size={20} /></div>
                        <span>Volunteer Applications</span>
                    </motion.a>

                    <motion.a
                        href="/admin/portals"
                        className={styles.actionBentoCard}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={styles.actionIconWrapper}><Icons.Globe /></div>
                        <span>Service Portals</span>
                    </motion.a>
                </div>
            </div>
        </div>
    );
}
