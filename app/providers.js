'use client';

import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import MeshGradient from '@/components/MeshGradient';
import SplashScreen from '@/components/SplashScreen';
import CustomCursor from '@/components/CustomCursor';

export default function Providers({ children }) {
    const [splashDone, setSplashDone] = useState(false);

    return (
        <AuthProvider>
            <LanguageProvider>
                {/* Custom cursor — always present, auto-hidden on mobile */}
                <CustomCursor />

                {/* Splash screen — shown only on first load */}
                <SplashScreen onComplete={() => setSplashDone(true)} />

                {/* Main app — rendered beneath splash, fades into view */}
                <div
                    style={{
                        opacity: splashDone ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                        pointerEvents: splashDone ? 'auto' : 'none',
                    }}
                >
                    <MeshGradient />
                    {children}
                </div>
            </LanguageProvider>
        </AuthProvider>
    );
}
