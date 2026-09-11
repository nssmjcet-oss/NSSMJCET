'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminPortalGate from '@/app/admin/AdminPortalGate';

export default function LoginPage() {
    const { authStatus, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && authStatus === 'authenticated') {
            router.push('/admin');
        }
    }, [authStatus, loading, router]);

    return (
        <main className="marvelous-theme">
            <AdminPortalGate />
        </main>
    );
}
