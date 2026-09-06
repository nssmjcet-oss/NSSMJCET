'use client';

import MUNLetterAnimation from './MUNLetterAnimation';
import YouthParliamentAnimation from './YouthParliamentAnimation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function InitiativeHero({ initiative, language = 'en' }) {
    if (!initiative) return null;

    const title = typeof initiative.title === 'object'
        ? (initiative.title[language] || initiative.title.en || 'Flagship Initiative')
        : (initiative.title || 'Flagship Initiative');

    const shortTitle = initiative.short_title || initiative.shortTitle || title;

    const subtitle = typeof initiative.tagline === 'object'
        ? (initiative.tagline[language] || initiative.tagline.en || '')
        : (initiative.tagline || '');

    const tag = typeof initiative.tag === 'object'
        ? (initiative.tag[language] || initiative.tag.en || '')
        : (initiative.tag || '');

    const style = initiative.animation_style || initiative.animationStyle || 'default';

    if (style === 'mun') {
        return (
            <MUNLetterAnimation
                title={shortTitle || title}
                subtitle={subtitle}
                tag={tag || 'SIGNATURE DIPLOMACY INITIATIVE'}
            />
        );
    }

    if (style === 'youth_parliament') {
        return (
            <YouthParliamentAnimation
                title={shortTitle || title}
                subtitle={subtitle}
                tag={tag || 'DEMOCRATIC ASSEMBLY'}
            />
        );
    }

    // Default High-Polish Hero
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '440px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            background: 'radial-gradient(circle at 50% 30%, rgba(255, 153, 51, 0.1), transparent 70%)'
        }}>
            {tag && (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 18px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 153, 51, 0.12)',
                    border: '1px solid rgba(255, 153, 51, 0.3)',
                    color: '#FF9933',
                    fontSize: '13px',
                    fontWeight: '800',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '20px'
                }}>
                    <Sparkles size={14} />
                    <span>{tag}</span>
                </div>
            )}

            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                    fontWeight: '900',
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: '#0f172a',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}
            >
                {title}
            </motion.h1>

            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        marginTop: '20px',
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                        fontWeight: '600',
                        color: '#475569',
                        maxWidth: '650px',
                        lineHeight: 1.6
                    }}
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}
