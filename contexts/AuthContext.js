"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [adminProfile, setAdminProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [authStatus, setAuthStatus] = useState('loading'); // 'authenticated' | 'unauthorized' | 'deactivated' | 'unauthenticated' | 'loading'
    const [authError, setAuthError] = useState(null);
    const [loading, setLoading] = useState(true);

    const verifyServerSession = useCallback(async (authUser) => {
        try {
            const token = await authUser.getIdToken(true);
            const res = await fetch(`/api/auth/session?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            const data = await res.json();

            if (res.ok && data.user) {
                setUser({
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: data.user.name || authUser.displayName || authUser.email.split('@')[0],
                    photoURL: data.user.photo_url || authUser.photoURL || ''
                });
                setAdminProfile(data.user);
                setRole(data.user.role);
                setAuthStatus('authenticated');
                setAuthError(null);
                return { success: true, user: data.user };
            } else {
                const code = data.code || 'UNAUTHORIZED';
                setUser({
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL
                });
                setAdminProfile(null);
                setRole(null);

                if (code === 'ACCOUNT_DEACTIVATED') {
                    setAuthStatus('deactivated');
                    setAuthError(data.error || 'Your NSS MJCET administrator access has been deactivated. Please contact the Super Admin.');
                } else {
                    setAuthStatus('unauthorized');
                    setAuthError(data.error || 'Your Google account is not authorized to access the NSS MJCET Admin Portal. Please contact the NSS MJCET Super Admin.');
                }
                return { success: false, code, error: data.error };
            }
        } catch (err) {
            console.error('[AuthContext] Session verification failed:', err);
            setAuthStatus('unauthorized');
            setAuthError('Connection error: Failed to verify administrator authorization.');
            setRole(null);
            setAdminProfile(null);
            return { success: false, code: 'NETWORK_ERROR', error: err.message };
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                await verifyServerSession(authUser);
            } else {
                setUser(null);
                setAdminProfile(null);
                setRole(null);
                setAuthStatus('unauthenticated');
                setAuthError(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [verifyServerSession]);

    // Google Sign-In (Primary Authentication)
    const loginWithGoogle = async () => {
        setLoading(true);
        setAuthError(null);
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            const verification = await verifyServerSession(result.user);
            setLoading(false);
            return verification;
        } catch (err) {
            setLoading(false);
            console.error('[AuthContext] Google Sign-In error:', err);
            // Ignore popup closed by user errors
            if (err.code !== 'auth/popup-closed-by-user') {
                setAuthError(err.message || 'Google Sign-In failed.');
            }
            throw err;
        }
    };

    // Legacy Email/Password Login (Preserved for migration)
    const login = async (email, password) => {
        setLoading(true);
        setAuthError(null);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const verification = await verifyServerSession(result.user);
            setLoading(false);
            return verification;
        } catch (err) {
            setLoading(false);
            console.error('[AuthContext] Email login error:', err);
            setAuthError(err.message || 'Login failed.');
            throw err;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setAdminProfile(null);
            setRole(null);
            setAuthStatus('unauthenticated');
            setAuthError(null);
        } catch (err) {
            console.error('[AuthContext] Logout error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            adminProfile,
            role,
            authStatus,
            authError,
            loading,
            loginWithGoogle,
            login,
            logout,
            refreshSession: () => auth.currentUser ? verifyServerSession(auth.currentUser) : null
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
