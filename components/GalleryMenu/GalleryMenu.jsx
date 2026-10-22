'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { getNavItems, navTranslations } from '@/utils/navigationData';
import styles from './GalleryMenu.module.css';

export default function GalleryMenu({
    showLogo = true,
    showMenuButton = true,
    isEnlarged = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { language } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const navItems = getNavItems(language);
    const t = navTranslations[language] || navTranslations.en;

    const triggerBtnRef = useRef(null);
    const panelRef = useRef(null);

    // Warm-prefetch all nav routes when user hovers or focuses the menu button
    const handleWarmPrefetch = () => {
        try {
            navItems.forEach((item) => {
                if (item.href && item.href !== pathname) {
                    router.prefetch(item.href);
                }
            });
        } catch (_) {}
    };

    // Toggle menu
    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleClose = () => {
        setIsOpen(false);
        triggerBtnRef.current?.focus();
    };

    // Keyboard accessibility: Esc to close, focus management
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // Focus first link in panel
        setTimeout(() => {
            const firstLink = panelRef.current?.querySelector('a, button');
            firstLink?.focus();
        }, 60);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // If an enlarged photo opens, close the menu panel
    useEffect(() => {
        if (isEnlarged && isOpen) {
            setIsOpen(false);
        }
    }, [isEnlarged, isOpen]);

    return (
        <>
            {/* Top-Left Floating NSS Logo */}
            {showLogo && (
                <Link
                    href="/"
                    className={styles.topLogoLink}
                    style={{
                        opacity: isEnlarged ? 0 : 1,
                        pointerEvents: isEnlarged ? 'none' : 'auto',
                    }}
                    title="Return to Home"
                    aria-label="NSS MJCET Home"
                >
                    <Image
                        src="/uploads/nss-logo.png"
                        alt="NSS MJCET"
                        width={64}
                        height={64}
                        className={styles.topLogoImg}
                        priority
                    />
                    <span className={styles.topLogoText}>NSS MJCET</span>
                </Link>
            )}

            {/* Top-Right Floating Hamburger Button */}
            {showMenuButton && (
                <button
                    ref={triggerBtnRef}
                    onClick={handleToggle}
                    onMouseEnter={handleWarmPrefetch}
                    onTouchStart={handleWarmPrefetch}
                    onFocus={handleWarmPrefetch}
                    className={`${styles.floatingMenuBtn} ${isOpen ? styles.open : ''}`}
                    style={{
                        opacity: isEnlarged ? 0 : 1,
                        pointerEvents: isEnlarged ? 'none' : 'auto',
                    }}
                    aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isOpen}
                    title={isOpen ? 'Close Menu (Esc)' : 'Menu'}
                >
                    <div className={styles.hamburgerIcon}>
                        <span className={styles.hamburgerLine} />
                        <span className={styles.hamburgerLine} />
                        <span className={styles.hamburgerLine} />
                    </div>
                </button>
            )}

            {/* Slide-out Menu Panel Backdrop */}
            {isOpen && (
                <div
                    className={styles.menuBackdrop}
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site navigation"
                >
                    <div
                        ref={panelRef}
                        className={styles.menuPanel}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Panel Header */}
                        <div className={styles.panelHeader}>
                            <Link href="/" className={styles.panelLogoWrap} onClick={handleClose}>
                                <Image
                                    src="/uploads/nss-logo.png"
                                    alt="NSS Logo"
                                    width={44}
                                    height={44}
                                    className={styles.panelLogoImg}
                                />
                                <div>
                                    <div className={styles.panelLogoTitle}>NSS MJCET</div>
                                    <div className={styles.panelLogoSubtitle}>Not Me But You</div>
                                </div>
                            </Link>

                            <button
                                className={styles.panelCloseBtn}
                                onClick={handleClose}
                                aria-label="Close menu"
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Navigation Links in exact order */}
                        <ul className={styles.navLinksList}>
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href} className={styles.navLinkItem}>
                                        <Link
                                            href={item.href}
                                            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                                            onClick={handleClose}
                                        >
                                            <span>{item.label}</span>
                                            {isActive && <span className={styles.activeDot} />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Panel Footer: Language Switcher & Join Us CTA */}
                        <div className={styles.panelFooter}>
                            <div className={styles.languageRow}>
                                <span>Language / భాష / भाषा</span>
                                <LanguageToggle />
                            </div>

                            <Link
                                href="/volunteer"
                                className={styles.joinUsBtn}
                                onClick={handleClose}
                            >
                                {t.volunteer || 'Join Us'}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
