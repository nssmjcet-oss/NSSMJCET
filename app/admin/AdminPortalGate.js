'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './portal.module.css';

export default function AdminPortalGate() {
    const {
        user,
        role,
        authStatus,
        authError,
        loading,
        loginWithGoogle,
        login,
        logout
    } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLegacy, setShowLegacy] = useState(false);
    const [legacyForm, setLegacyForm] = useState({ email: '', password: '' });
    const [legacyError, setLegacyError] = useState('');

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error('Google sign-in caught:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLegacySubmit = async (e) => {
        e.preventDefault();
        setLegacyError('');
        setIsSubmitting(true);
        try {
            await login(legacyForm.email, legacyForm.password);
        } catch (err) {
            setLegacyError(err.message || 'Login failed. Check credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSwitchAccount = async () => {
        await logout();
    };

    // CASE C: Google account not approved in database
    if (authStatus === 'unauthorized') {
        return (
            <div className={styles.portalContainer}>
                <div className={styles.portalCard}>
                    <div className={styles.cardTopAccent} />
                    <div className={styles.logoWrapper}>
                        <img src="/uploads/nss-logo.png" alt="NSS Logo" className={styles.logoImg} />
                    </div>

                    <div className={`${styles.statusBadge} ${styles.badgeRestricted}`}>
                        <span>●</span> Access Restricted
                    </div>

                    <h2 className={styles.errorHeading}>Access Restricted</h2>

                    {user?.email && (
                        <div className={styles.userEmailPill} title={user.email}>
                            {user.email}
                        </div>
                    )}

                    <p className={styles.errorDescription}>
                        Your Google account is not authorized to access the NSS MJCET Admin Portal.
                        <br /><br />
                        Please contact the NSS MJCET Super Admin.
                    </p>

                    <div className={styles.actionStack}>
                        <button
                            type="button"
                            onClick={handleSwitchAccount}
                            className={styles.btnPrimary}
                        >
                            Sign in with another account
                        </button>

                        <Link href="/" className={styles.btnSecondary}>
                            Back to NSS MJCET
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // CASE D: Account is deactivated
    if (authStatus === 'deactivated') {
        return (
            <div className={styles.portalContainer}>
                <div className={styles.portalCard}>
                    <div className={styles.cardTopAccent} />
                    <div className={styles.logoWrapper}>
                        <img src="/uploads/nss-logo.png" alt="NSS Logo" className={styles.logoImg} />
                    </div>

                    <div className={`${styles.statusBadge} ${styles.badgeDeactivated}`}>
                        <span>●</span> Account Deactivated
                    </div>

                    <h2 className={styles.errorHeading}>Account Deactivated</h2>

                    {user?.email && (
                        <div className={styles.userEmailPill} title={user.email}>
                            {user.email}
                        </div>
                    )}

                    <p className={styles.errorDescription}>
                        Your NSS MJCET administrator access has been deactivated.
                        <br /><br />
                        Please contact the Super Admin.
                    </p>

                    <div className={styles.actionStack}>
                        <button
                            type="button"
                            onClick={handleSwitchAccount}
                            className={styles.btnPrimary}
                        >
                            Sign in with another account
                        </button>

                        <Link href="/" className={styles.btnSecondary}>
                            Back to NSS MJCET
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Unauthenticated: NSS MJCET Admin Portal Login Gate
    return (
        <div className={styles.portalContainer}>
            <div className={styles.portalCard}>
                <div className={styles.cardTopAccent} />
                
                <div className={styles.logoWrapper}>
                    <img src="/uploads/nss-logo.png" alt="NSS MJCET Logo" className={styles.logoImg} />
                </div>

                <div className={styles.portalOrg}>NSS MJCET</div>
                <h1 className={styles.portalTitle}>ADMIN PORTAL</h1>
                <p className={styles.portalSubtitle}>Manage the official NSS MJCET website</p>

                {authError && (
                    <div style={{
                        padding: '10px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#b91c1c',
                        fontSize: '13px',
                        marginBottom: '20px',
                        textAlign: 'left'
                    }}>
                        {authError}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || loading}
                    className={styles.googleBtn}
                    aria-label="Continue with Google"
                >
                    <svg className={styles.googleIcon} viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                    <span>{isSubmitting ? 'Authenticating...' : 'Continue with Google'}</span>
                </button>

                <p className={styles.noticeText}>
                    Authorized administrators only.
                </p>

                {/* Optional Collapsible Legacy Login for existing admin accounts */}
                <div style={{ marginTop: '16px' }}>
                    <button
                        type="button"
                        onClick={() => setShowLegacy(!showLegacy)}
                        className={styles.legacyToggle}
                    >
                        {showLegacy ? 'Hide email sign in' : 'Sign in with email & password'}
                    </button>

                    {showLegacy && (
                        <form onSubmit={handleLegacySubmit} className={styles.legacyForm}>
                            {legacyError && (
                                <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '8px' }}>
                                    {legacyError}
                                </div>
                            )}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={legacyForm.email}
                                    onChange={e => setLegacyForm({ ...legacyForm, email: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Password</label>
                                <input
                                    type="password"
                                    required
                                    value={legacyForm.password}
                                    onChange={e => setLegacyForm({ ...legacyForm, password: e.target.value })}
                                    className={styles.formInput}
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={styles.legacySubmitBtn}
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In with Email'}
                            </button>
                        </form>
                    )}
                </div>

                <div className={styles.portalFooter}>
                    <Link href="/" className={styles.backLink}>
                        ← Back to NSS MJCET
                    </Link>
                </div>
            </div>
        </div>
    );
}
