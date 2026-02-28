'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    // Load language preference from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('nss-language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    // Save language preference to localStorage when it changes
    const changeLanguage = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('nss-language', newLanguage);
    };

    const toggleLanguage = () => {
        let newLanguage;
        if (language === 'en') newLanguage = 'te';
        else if (language === 'te') newLanguage = 'hi';
        else newLanguage = 'en';
        changeLanguage(newLanguage);
    };

    const value = {
        language,
        setLanguage: changeLanguage,
        toggleLanguage,
        isEnglish: language === 'en',
        isTelugu: language === 'te',
        isHindi: language === 'hi',
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

/**
 * Helper function to get text in current language
 * @param {Object} textObj - Object with 'en' and 'te' properties
 * @param {string} currentLanguage - Current language ('en' or 'te')
 * @returns {string} - Text in current language
 */
export function getText(textObj, currentLanguage = 'en') {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    return textObj[currentLanguage] || textObj.en || '';
}
