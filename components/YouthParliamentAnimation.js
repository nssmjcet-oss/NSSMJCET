'use client';

import { motion } from 'framer-motion';
import styles from './YouthParliamentAnimation.module.css';
import { Award, Landmark } from 'lucide-react';

export default function YouthParliamentAnimation({
    title = 'YOUTH PARLIAMENT',
    subtitle = 'Empowering Democratic Discourse, Policy Debate & National Leadership',
    tag = 'FLAGSHIP PARLIAMENTARY ASSEMBLY'
}) {
    const words = title.split(' ');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.18,
                delayChildren: 0.1
            }
        }
    };

    const wordVariants = {
        hidden: { opacity: 0, y: 35, filter: 'blur(6px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <div className={styles.ypContainer}>
            {tag && (
                <motion.div
                    className={styles.badgePill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <Landmark size={15} />
                    <span>{tag}</span>
                </motion.div>
            )}

            <motion.div
                className={styles.titleWrapper}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {words.map((word, idx) => {
                    const isHighlight = idx === 0 || word.toLowerCase().includes('parliament');
                    return (
                        <motion.span
                            key={idx}
                            className={isHighlight ? styles.highlightWord : styles.wordSpan}
                            variants={wordVariants}
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </motion.div>

            {subtitle && (
                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.45 }}
                >
                    {subtitle}
                </motion.p>
            )}

            <motion.div
                className={styles.ashokaSymbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.65 }}
            >
                <div className={styles.symbolLine} />
                <Award size={16} style={{ color: '#138808' }} />
                <span>MJCET Chapter Assembly</span>
                <div className={styles.symbolLineRight} />
            </motion.div>
        </div>
    );
}
