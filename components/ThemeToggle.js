'use client';

import { useTheme } from '@/contexts/ThemeContext';
import styles from './ThemeToggle.module.css';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className={`${styles.iconWrapper} ${theme === 'dark' ? styles.isDark : ''}`}>
                <span className={styles.sun}><Sun size={18} /></span>
                <span className={styles.moon}><Moon size={18} /></span>
            </div>
        </button>
    );
}
