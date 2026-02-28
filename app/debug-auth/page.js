'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import Link from 'next/link';

export default function DebugAuth() {
    const { user, role, loading } = useAuth();
    const [serverRole, setServerRole] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [isCheckingServer, setIsCheckingServer] = useState(false);

    const currentDbId = db._databaseId?.database || 'unknown';
    // Firebase defaults can be 'default' or '(default)'
    const isCorrectId = currentDbId === 'default' || currentDbId === '(default)';

    const checkServerRole = async () => {
        if (!user) return;
        setIsCheckingServer(true);
        setServerError(null);
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const res = await fetch('/api/auth/role', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setServerRole(data.role);
            } else {
                setServerError(data.error);
            }
        } catch (e) {
            setServerError(e.message);
        } finally {
            setIsCheckingServer(false);
        }
    };

    useEffect(() => {
        if (user) checkServerRole();
    }, [user]);

    if (loading) {
        return <div style={{ padding: '100px', textAlign: 'center' }}><h1>Loading System Info...</h1></div>;
    }

    const isSuperAdmin = serverRole === 'superadmin' || role === 'superadmin';

    return (
        <div style={{ padding: '40px', background: isSuperAdmin ? '#f0fdf4' : 'white', minHeight: '100vh', color: '#000', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#111', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                System Verification Dashboard
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                {/* Client Side Card */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: isCorrectId ? '2px solid #22c55e' : '2px solid #ef4444' }}>
                    <h3 style={{ marginTop: 0 }}>Step 1: Client Connection</h3>
                    <p>Browser Database ID: <strong style={{ color: isCorrectId ? 'green' : 'red' }}>{currentDbId}</strong></p>
                    {isCorrectId ? (
                        <p style={{ color: 'green', fontWeight: 'bold' }}>✅ MATCHED SUCCESSFULLY!</p>
                    ) : (
                        <div>
                            <p style={{ color: 'red' }}>❌ MISMATCH: Browser is using <code>{currentDbId}</code></p>
                            <p style={{ fontSize: '13px', color: '#666' }}>Next.js is caching an old connection. Restart your server if ncessary.</p>
                        </div>
                    )}
                </div>

                {/* Server Side Card */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: serverRole ? '2px solid #22c55e' : '2px solid #aaa' }}>
                    <h3 style={{ marginTop: 0 }}>Step 2: Server Verification</h3>
                    <p>Status: {isCheckingServer ? 'Checking...' : 'Check Complete'}</p>
                    {serverRole ? (
                        <div>
                            <p>Server-Confirmed Role: <strong style={{ color: 'green', fontSize: '18px' }}>{serverRole.toUpperCase()}</strong></p>
                            <p style={{ color: 'green', fontWeight: 'bold' }}>✅ ACCESS READY!</p>
                        </div>
                    ) : serverError ? (
                        <p style={{ color: 'red' }}>❌ Server Error: {serverError}</p>
                    ) : (
                        <button onClick={checkServerRole} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>RE-VERIFY SERVER</button>
                    )}
                </div>
            </div>

            {isSuperAdmin && (
                <div style={{ padding: '30px', background: '#22c55e', color: 'white', borderRadius: '15px', marginBottom: '30px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>Access is Officially Restored! 🚀</h2>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>The server has confirmed you are a Super Admin.</p>

                    <div style={{ marginTop: '25px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <Link href="/admin" style={{ padding: '15px 30px', background: 'white', color: '#166534', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                            ENTER ADMIN PANEL
                        </Link>
                        <button onClick={() => window.location.reload()} style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            REFRESH PERMISSIONS
                        </button>
                    </div>
                </div>
            )}

            <section style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginTop: 0 }}>Instructions to Fix Role: NONE</h2>
                <p>If you see <strong>&quot;Role: NONE&quot;</strong> but the server verification is <strong>GREEN</strong>:</p>
                <ol style={{ lineHeight: '1.8' }}>
                    <li>Open this URL in an <strong>Incognito Window</strong>.</li>
                    <li>Log in with your email.</li>
                    <li>The role will immediately show up as <strong>Super Admin</strong>.</li>
                </ol>
                <p style={{ fontSize: '13px', color: '#666' }}>This happens because your main browser is holding onto an &quot;Offline Cache&quot; of the old database. Incognito skips this cache.</p>
            </section>
        </div>
    );
}
