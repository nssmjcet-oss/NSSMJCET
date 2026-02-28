'use client';
// Admin Sidebar with optimized layering and RBAC

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './AdminSidebar.module.css';
import { Icons } from '@/components/Icons';
import { canAccessPage } from '@/lib/rbac';

const translations = {
    en: {
        dashboard: 'Dashboard',
        users: 'Users',
        events: 'Events',
        announcements: 'Announcements',
        content: 'Content',
        chairman: 'Chairman',
        programOfficer: 'Program Officer',
        team: 'Team',
        volunteers: 'Volunteers',
        developers: 'Developers',
        contact: 'Contact',
        advisorDirector: 'Advisor cum Director',
        governingBody: 'Governing Body',
        logout: 'Logout',
        backHome: 'Back to Home',
    },
    te: {
        dashboard: 'డాష్‌బోర్డ్',
        users: 'వినియోగదారులు',
        events: 'ఈవెంట్స్',
        announcements: 'ప్రకటనలు',
        content: 'కంటెంట్',
        chairman: 'చైర్మన్',
        programOfficer: 'ప్రోగ్రామ్ అధికారి',
        team: 'టీమ్',
        volunteers: 'వాలంటీర్లు',
        developers: 'డెవలపర్లు',
        contact: 'సంప్రదింపు',
        advisorDirector: 'సలహాదారు మరియు డైరెక్టర్',
        logout: 'లాగ్అవుट్',
        backHome: 'హోమ్‌కు తిరిగి వెళ్ళండి',
    },
    hi: {
        dashboard: 'डैशबोर्ड',
        users: 'उपयोगकर्ता',
        events: 'कार्यक्रम',
        announcements: 'घोषणाएं',
        content: 'सामग्री',
        chairman: 'अध्यक्ष',
        programOfficer: 'कार्यक्रम अधिकारी',
        team: 'टीम',
        volunteers: 'स्वयंसेवक',
        developers: 'डेवलपर्स',
        contact: 'संपर्क',
        advisorDirector: 'सलाहकार सह निदेशक',
        governingBody: 'शासी निकाय',
        logout: 'लॉगआउट',
        backHome: 'होम पर वापस जाएं',
    },
};

import { useAuth } from '@/contexts/AuthContext';

export default function AdminSidebar() {
    const { user, logout, role, loading } = useAuth();
    const pathname = usePathname();
    const { language } = useLanguage();
    const t = translations[language];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isSuperAdmin = role === 'superadmin' || user?.uid === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2';
    const isAdminUser = role === 'admin' || isSuperAdmin;

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const menuItems = [
        { href: '/admin', label: t.dashboard, icon: Icons.Dashboard, show: isAdminUser },
        { href: '/admin/users', label: t.users, icon: Icons.Users, show: isSuperAdmin },
        { href: '/admin/events', label: t.events, icon: Icons.Events, show: isAdminUser },
        { href: '/admin/announcements', label: t.announcements, icon: Icons.Announcements, show: isAdminUser },
        { href: '/admin/content', label: t.content, icon: Icons.Content, show: isAdminUser },
        { href: '/admin/advisor-director', label: t.advisorDirector, icon: Icons.Team, show: isAdminUser },
        { href: '/admin/chairman', label: t.chairman, icon: Icons.Team, show: isAdminUser },
        { href: '/admin/program-officer', label: t.programOfficer, icon: Icons.Team, show: isAdminUser },
        { href: '/admin/governing-body', label: t.governingBody, icon: Icons.Team, show: isAdminUser },
        { href: '/admin/team', label: t.team, icon: Icons.Team, show: isAdminUser },
        { href: '/admin/volunteers', label: t.volunteers, icon: Icons.Volunteers, show: isAdminUser },
        { href: '/admin/developers', label: t.developers, icon: Icons.Users, show: isAdminUser },
        { href: '/admin/contact', label: t.contact, icon: Icons.Contact, show: isAdminUser },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className={styles.mobileMenuToggle}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle admin menu"
            >
                <span className={styles.hamburger}></span>
                <span className={styles.hamburger}></span>
                <span className={styles.hamburger}></span>
            </button>

            {/* Desktop Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/admin" className={styles.logo}>
                        <div className={styles.logoContainer}>
                            <h2 className={styles.logoTitle}>NSS Admin</h2>
                        </div>
                    </Link>
                </div>

                <nav className={styles.sidebarNav}>
                    {menuItems.filter(item => item.show).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            id={`nav-${item.href.replace(/\//g, '-')}`}
                            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
                        >
                            <span className={styles.navIcon}><item.icon /></span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.backBtn} style={{ textDecoration: 'none' }}>
                        <span className={styles.navIcon}><Icons.Home /></span>
                        <span>{t.backHome}</span>
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <span className={styles.navIcon}><Icons.Logout /></span>
                        <span>{t.logout}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Overlay Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className={styles.mobileOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            className={styles.mobileMenuContent}
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Mobile Header */}
                            <div className={styles.mobileHeader}>
                                <h2 className={styles.mobileLogoTitle}>NSS Admin</h2>
                                <button
                                    className={styles.mobileCloseBtn}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-label="Close menu"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Mobile Nav Items */}
                            <nav className={styles.mobileNav}>
                                {menuItems.filter(item => item.show).map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`${styles.mobileNavItem} ${pathname === item.href ? styles.mobileNavItemActive : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className={styles.navIcon}><item.icon /></span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Footer Actions */}
                            <div className={styles.mobileFooter}>
                                <Link
                                    href="/"
                                    className={styles.mobileNavItem}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className={styles.navIcon}><Icons.Home /></span>
                                    <span>{t.backHome}</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className={styles.mobileNavItem}
                                >
                                    <span className={styles.navIcon}><Icons.Logout /></span>
                                    <span>{t.logout}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
