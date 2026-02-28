import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nss-mjcet-website';
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

function initAdminApp() {
    const apps = getApps();
    if (apps.length > 0) return apps[0];

    // Ensure we have the minimum required config
    if (!projectId) {
        console.error('Firebase Admin: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing');
        return null;
    }

    const config = {
        projectId,
        storageBucket
    };

    if (clientEmail && privateKey) {
        try {
            // Robust private key cleaning for different env formats
            const cleanedKey = privateKey
                .replace(/\\n/g, '\n')
                .replace(/^['"]|['"]$/g, '')
                .trim();

            config.credential = cert({
                projectId,
                clientEmail,
                privateKey: cleanedKey
            });
        } catch (error) {
            console.error('Firebase Admin Cert Error:', error);
        }
    }

    try {
        return initializeApp(config);
    } catch (error) {
        // Only log serious failures, not "already exists" errors (handled by getApps)
        if (!error.message?.includes('already exists')) {
            console.error('Firebase Admin initializeApp Error:', error);
        }
        return getApps()[0] || null;
    }
}

const app = initAdminApp();

// Use the standard '(default)' database instance
export const adminDb = app ? getFirestore(app, 'default') : null;
export const adminAuth = app ? getAuth(app) : null;
export const adminStorage = app ? getStorage(app) : null;
