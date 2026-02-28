'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import MeshGradient from '@/components/MeshGradient';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <MeshGradient />
                {children}
            </LanguageProvider>
        </AuthProvider>
    );
}
