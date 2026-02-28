"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import styles from './Navbar.module.css';
import { canAccessAdminPanel } from '@/lib/rbac';
import { useAuth } from '@/contexts/AuthContext';

const translations = {
    en: {
        home: 'Home',
        about: 'About NSS',
        unit: 'Unit Details',
        events: 'Events',
        events: 'Events',
        team: 'Team',
        announcements: 'Announcements',
        volunteer: 'Join Us',
        contact: 'Contact',
        login: 'Login',
        admin: 'Admin',
        logout: 'Logout',
    },
    te: {
        home: 'హోమ్',
        about: 'NSS గురించి',
        unit: 'యూనిట్ వివరాలు',
        events: 'ఈవెంట్స్',
        events: 'ఈవెంట్స్',
        team: 'టీమ్',
        announcements: 'ప్రకటనలు',
        volunteer: 'మాతో చేరండి',
        contact: 'సంప్రదించండి',
        login: 'లాగిన్',
        admin: 'అడ్మిన్',
        logout: 'లాగ్ అవుట్',
    },
    hi: {
        home: 'होम',
        about: 'एनएसएस के बारे में',
        unit: 'यूनिट विवरण',
        events: 'कार्यक्रम',
        events: 'कार्यक्रम',
        team: 'टीम',
        announcements: 'घोषणाएं',
        volunteer: 'हमसे जुड़ें',
        contact: 'संपर्क',
        login: 'लॉगिन',
        admin: 'एडमिन',
        logout: 'लॉगआउट',
    },
};

export default function Navbar() {
    const { user, role, logout } = useAuth();
    const session = user ? { ...user, role } : null;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { language } = useLanguage();
    const pathname = usePathname();
    const t = translations[language] || translations['en'] || translations.en;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navItems = [
        { label: t.home, href: '/' },
        { label: t.about, href: '/about' },
        { label: t.unit, href: '/unit' },
        { label: t.events, href: '/events' },
        { label: t.team, href: '/team' },
        { label: t.announcements, href: '/announcements' },
        { label: t.contact, href: '/contact' },
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
            <motion.nav
                className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
                data-language={language}
                initial={{ y: -100, x: '-50%' }}
                animate={{ y: 0, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
                <div className={styles.logoWrapper}>
                    <Link href="/" className={styles.logo}>
                        <img src="/uploads/nss-logo (1).png" alt="NSS Logo" className={styles.largeLogo} />
                    </Link>
                </div>

                <div className={`container ${styles.navContainer}`}>
                    <div className={styles.hamburgerWrapper} onClick={toggleMenu}>
                        <button className={styles.menuToggle} aria-label="Toggle menu">
                            <span className={styles.hamburger}></span>
                            <span className={styles.hamburger}></span>
                            <span className={styles.hamburger}></span>
                        </button>
                    </div>

                    <div className={styles.desktopNav}>
                        <div className={styles.centerSection}>
                            <div className={styles.navLinks}>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={pathname === item.href ? styles.active : ''}
                                    >
                                        {item.label}
                                        {pathname === item.href && (
                                            null
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className={styles.rightSection}>
                            <div className={styles.navActions}>
                                <LanguageToggle />
                                <div className={styles.authButtons}>
                                    <Link href="/volunteer" className={`${styles.volunteerLink} ${pathname === '/volunteer' ? styles.active : ''}`}>
                                        {t.volunteer}
                                    </Link>

                                    {session && (
                                        <Link href="/admin" className="marvelous-btn marvelous-btn-outline marvelous-btn-sm" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                            {t.admin}
                                        </Link>
                                    )}

                                    {session ? (
                                        <button onClick={handleLogout} className="marvelous-btn marvelous-btn-outline marvelous-btn-sm" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                            {t.logout}
                                        </button>
                                    ) : (
                                        <Link href="/login" className="marvelous-btn marvelous-btn-primary marvelous-btn-sm" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                            {t.login}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div className={styles.mobileOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <button className={styles.mobileCloseBtn} onClick={toggleMenu} aria-label="Close menu">×</button>
                        <motion.div className={styles.mobileMenuContent} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href} className={`${styles.mobileMenuItem} ${pathname === item.href ? styles.mobileMenuItemActive : ''}`} onClick={toggleMenu}>
                                    {item.label}
                                </Link>
                            ))}
                            <div className={styles.mobileDivider}></div>
                            <Link href="/volunteer" className={`${styles.mobileMenuItem} ${styles.mobileMenuItemCTA}`} onClick={toggleMenu}>
                                {t.volunteer}
                            </Link>
                            <div className={styles.mobileDivider}></div>
                            {session && (
                                <Link href="/admin" className={styles.mobileMenuItem} onClick={toggleMenu}>
                                    {t.admin}
                                </Link>
                            )}
                            {session ? (
                                <button onClick={() => { toggleMenu(); handleLogout(); }} className={styles.mobileMenuItem}>
                                    {t.logout}
                                </button>
                            ) : (
                                <Link href="/login" className={styles.mobileMenuItem} onClick={toggleMenu}>
                                    {t.login}
                                </Link>
                            )}
                            <div className={styles.mobileDivider}></div>
                            <div className={styles.mobileLanguageToggle}>
                                <LanguageToggle />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
