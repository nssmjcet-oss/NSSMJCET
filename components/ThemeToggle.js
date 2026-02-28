'use client';

import { useTheme } from '@/contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className={`${styles.iconWrapper} ${theme === 'dark' ? styles.isDark : ''}`}>
                <span className={styles.sun}>☀️</span>
                <span className={styles.moon}>🌙</span>
            </div>
        </button>
    );
}
