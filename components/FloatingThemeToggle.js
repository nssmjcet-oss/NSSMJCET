import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/Icons';
import styles from './FloatingThemeToggle.module.css';

export default function FloatingThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={styles.toggleContainer}>
            {/* Dark/Light Toggle */}
            <motion.button
                className={styles.floatingToggle}
                onClick={toggleTheme}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        className={styles.iconContainer}
                    >
                        {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
                    </motion.div>
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
