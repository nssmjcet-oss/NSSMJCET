'use client';

import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MeshGradient from '@/components/MeshGradient';
import SplashScreen from '@/components/SplashScreen';
import CustomCursor from '@/components/CustomCursor';

export default function Providers({ children }) {
    const [splashDone, setSplashDone] = useState(false);

    return (
        <AuthProvider>
            <LanguageProvider>
                <ThemeProvider>
                    {/* Custom cursor — always present, auto-hidden on mobile */}
                    <CustomCursor />

                    {/* Splash screen — overlay shown on first load */}
                    <SplashScreen onComplete={() => setSplashDone(true)} />

                    {/* Main app — instantly interactive and rendered */}
                    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
                        <MeshGradient />
                        {children}
                    </div>
                </ThemeProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}

