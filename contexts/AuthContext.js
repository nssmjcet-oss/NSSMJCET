"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[AuthContext] Setting up onAuthStateChanged listener');
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            console.log('[AuthContext] Auth State Updated:', authUser ? 'User Logged In' : 'User Logged Out');

            if (authUser) {
                let userRole = null;
                try {
                    // Safety timeout for role resolution (5 seconds)
                    const rolePromise = (async () => {
                        // Fast-track for Super Admin UID
                        if (authUser.uid === 'z3VKS1U11ETzBiPw5VtojR2Zmvd2') {
                            console.log('[AuthContext] Primary SuperAdmin detected via UID');
                            return 'superadmin';
                        }

                        console.log('[AuthContext] Resolving role for:', authUser.uid);
                        // Check both user collections
                        const collections = ['users', 'user'];
                        for (const coll of collections) {
                            try {
                                console.log(`[AuthContext] Checking collection: ${coll}...`);
                                const userDoc = await getDoc(doc(db, coll, authUser.uid));
                                if (userDoc.exists() && userDoc.data()?.role) {
                                    const r = userDoc.data().role;
                                    console.log(`[AuthContext] Role found in '${coll}':`, r);
                                    return r;
                                }
                            } catch (e) {
                                console.warn(`[AuthContext] Firestore fetch from '${coll}' failed:`, e.message);
                            }
                        }

                        // Server-side fallback if still no role
                        console.log('[AuthContext] Falling back to server-side role check');
                        try {
                            const token = await authUser.getIdToken();
                            const res = await fetch('/api/auth/role', {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                                const data = await res.json();
                                if (data.role && data.role !== 'NONE') {
                                    console.log('[AuthContext] Role found via API:', data.role);
                                    return data.role;
                                }
                            }
                        } catch (e) {
                            console.warn('[AuthContext] API role check failed:', e.message);
                        }

                        return 'user';
                    })();

                    // Race against a 5-second timeout
                    const timeoutPromise = new Promise(resolve => setTimeout(() => {
                        console.warn('[AuthContext] Role resolution timed out - defaulting to user');
                        resolve('user');
                    }, 5000));

                    userRole = await Promise.race([rolePromise, timeoutPromise]);

                } catch (err) {
                    console.error('[AuthContext] Unexpected error during role resolution:', err);
                    userRole = 'user';
                }

                setRole(userRole);
                setUser({
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: authUser.displayName,
                });
            } else {
                setUser(null);
                setRole(null);
            }

            console.log('[AuthContext] Initialization Complete');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
