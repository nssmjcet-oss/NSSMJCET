'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            className={styles.toggle}
            onClick={toggleLanguage}
            aria-label="Toggle language"
        >
            <span className={`${styles.option} ${language === 'en' ? styles.active : ''}`}>
                EN
            </span>
            <span className={`${styles.option} ${language === 'te' ? styles.active : ''}`}>
                తె
            </span>
            <span className={`${styles.option} ${language === 'hi' ? styles.active : ''}`}>
                हि
            </span>
        </button>
    );
}
