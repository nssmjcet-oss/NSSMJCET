'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MeshGradient from '@/components/MeshGradient';
import SplashScreen from '@/components/SplashScreen';
import CustomCursor from '@/components/CustomCursor';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <ThemeProvider>
                    {/* Custom cursor — auto-hidden on mobile */}
                    <CustomCursor />

                    {/* Splash screen — fixed overlay, self-dismisses after 1.8s.
                        Content underneath is always rendered — splash just covers it. */}
                    <SplashScreen />

                    {/* Ambient bg layer */}
                    <MeshGradient />

                    {/* Main app content */}
                    {children}
                </ThemeProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
