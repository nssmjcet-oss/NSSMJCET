"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import styles from './Navbar.module.css';
import { useAuth } from '@/contexts/AuthContext';

const translations = {
    en: {
        home: 'Home',
        about: 'About NSS',
        unit: 'Unit Details',
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
    const router = useRouter();
    const t = translations[language] || translations['en'] || translations.en;

    // Intelligent route & data prefetch on hover/focus/touch
    const prefetchedRoutes = useRef(new Set());
    const handlePrefetchRoute = (href) => {
        if (!href || prefetchedRoutes.current.has(href)) return;
        prefetchedRoutes.current.add(href);

        // 1. Next.js router prefetch code & flight data
        try {
            router.prefetch(href);
        } catch (e) {}

        // 2. Pre-warm data cache for the target route
        if (href === '/team') {
            fetchWithCache('/api/stats');
        } else if (href === '/events') {
            fetchWithCache('/api/events');
        } else if (href === '/about') {
            fetchWithCache('/api/content?pageId=about');
        } else if (href === '/unit') {
            fetchWithCache('/api/stats');
            fetchWithCache('/api/content?pageId=unit');
        } else if (href === '/volunteer') {
            fetchWithCache('/api/stats');
            fetchWithCache('/api/content?pageId=volunteer_gallery');
        } else if (href === '/announcements') {
            fetchWithCache('/api/announcements');
        }
    };

    // Magnetic Button Coordinates using Ref + Transform to avoid rerendering Navbar
    const magneticBtnRef = useRef(null);
    const handleMagneticMove = (e) => {
        if (!magneticBtnRef.current) return;
        const rect = magneticBtnRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
        magneticBtnRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        magneticBtnRef.current.style.transition = 'transform 0.1s ease-out';
    };

    const handleMagneticLeave = () => {
        if (!magneticBtnRef.current) return;
        magneticBtnRef.current.style.transform = 'translate3d(0, 0, 0)';
        magneticBtnRef.current.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
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

    const closeMenu = () => {
        document.body.style.overflow = '';
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            setIsMenuOpen(true);
        }
    };

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

    // Stagger animation rules for mobile menu items
    const mobileContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.15
            }
        }
    };

    const mobileItemVariants = {
        hidden: { opacity: 0, x: -30 },
        show: { 
            opacity: 1, 
            x: 0, 
            transition: { 
                type: 'spring', 
                stiffness: 280, 
                damping: 25 
            } 
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
                    <Link href="/" className={styles.logo} onMouseEnter={() => handlePrefetchRoute('/')}>
                        <Image 
                            src="/uploads/nss-logo.png" 
                            alt="NSS Logo" 
                            width={110} 
                            height={110} 
                            className={styles.largeLogo} 
                            priority
                        />
                    </Link>
                </div>

                <div className={`container ${styles.navContainer}`}>
                    <div className={styles.desktopNav}>
                        <div className={styles.centerSection}>
                            <div className={styles.navLinks}>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        prefetch={true}
                                        onMouseEnter={() => handlePrefetchRoute(item.href)}
                                        onFocus={() => handlePrefetchRoute(item.href)}
                                        onTouchStart={() => handlePrefetchRoute(item.href)}
                                        className={pathname === item.href ? styles.active : ''}
                                    >
                                        {item.label}
                                        {pathname === item.href && (
                                            <motion.span 
                                                layoutId="navActiveUnderline"
                                                className={styles.activeUnderline}
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className={styles.rightSection}>
                            <div className={styles.navActions}>
                                <LanguageToggle />
                                <div className={styles.authButtons}>
                                    {/* Magnetic Join Us button */}
                                    <div
                                        ref={magneticBtnRef}
                                        onMouseMove={handleMagneticMove}
                                        onMouseLeave={handleMagneticLeave}
                                        onMouseEnter={() => handlePrefetchRoute('/volunteer')}
                                        onTouchStart={() => handlePrefetchRoute('/volunteer')}
                                        style={{ display: 'inline-block' }}
                                    >
                                        <Link href="/volunteer" prefetch={true} className={`${styles.volunteerLink} ${pathname === '/volunteer' ? styles.active : ''}`}>
                                            {t.volunteer}
                                        </Link>
                                    </div>

                                    {session && (
                                        <Link href="/admin" className="marvelous-btn marvelous-btn-outline marvelous-btn-sm" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                            {t.admin}
                                        </Link>
                                    )}

                                    {session && (
                                        <button onClick={handleLogout} className="marvelous-btn marvelous-btn-outline marvelous-btn-sm" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                            {t.logout}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hamburger Wrapper */}
            <div className={styles.hamburgerWrapper} onClick={toggleMenu}>
                <button className={styles.menuToggle} aria-label="Toggle menu">
                    <span className={styles.hamburger}></span>
                    <span className={styles.hamburger}></span>
                    <span className={styles.hamburger}></span>
                </button>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        className={styles.mobileOverlay} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.3 }}
                    >
                        <button className={styles.mobileCloseBtn} onClick={toggleMenu} aria-label="Close menu">×</button>
                        
                        <motion.div 
                            className={styles.mobileMenuContent} 
                            variants={mobileContainerVariants}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                        >
                            {navItems.map((item) => (
                                <motion.div key={item.href} variants={mobileItemVariants}>
                                    <Link 
                                        href={item.href} 
                                        prefetch={true} 
                                        onTouchStart={() => handlePrefetchRoute(item.href)}
                                        className={`${styles.mobileMenuItem} ${pathname === item.href ? styles.mobileMenuItemActive : ''}`} 
                                        onClick={closeMenu}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                            
                            <motion.div variants={mobileItemVariants} className={styles.mobileDivider}></motion.div>
                            
                            <motion.div variants={mobileItemVariants}>
                                <Link 
                                    href="/volunteer" 
                                    prefetch={true} 
                                    onTouchStart={() => handlePrefetchRoute('/volunteer')}
                                    className={`${styles.mobileMenuItem} ${styles.mobileMenuItemCTA}`} 
                                    onClick={closeMenu}
                                >
                                    {t.volunteer}
                                </Link>
                            </motion.div>
                            
                            {session && (
                                <>
                                    <motion.div variants={mobileItemVariants} className={styles.mobileDivider}></motion.div>
                                    <motion.div variants={mobileItemVariants}>
                                        <Link href="/admin" className={styles.mobileMenuItem} onClick={toggleMenu}>
                                            {t.admin}
                                        </Link>
                                    </motion.div>
                                </>
                            )}
                            
                            {session && (
                                <motion.div variants={mobileItemVariants}>
                                    <button onClick={() => { toggleMenu(); handleLogout(); }} className={styles.mobileMenuItem}>
                                        {t.logout}
                                    </button>
                                </motion.div>
                            )}
                            
                            <motion.div variants={mobileItemVariants} className={styles.mobileDivider}></motion.div>
                            
                            <motion.div variants={mobileItemVariants} className={styles.mobileLanguageToggle}>
                                <LanguageToggle />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
