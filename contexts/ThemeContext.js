'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    useEffect(() => {
        // Force light mode permanently
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.setAttribute('data-patriotic', 'true');
        document.body.classList.add('marvelous-theme');
        // Clear any saved dark mode preference
        localStorage.removeItem('theme');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => { } }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
