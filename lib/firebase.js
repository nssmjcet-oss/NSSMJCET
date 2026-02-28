import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const DATABASE_ID = 'default';

let db;
try {
    // Try to get existing one first
    db = getFirestore(app, DATABASE_ID);
    console.log(`[Firebase] Firestore active with ID: ${DATABASE_ID}`);
} catch (e) {
    db = initializeFirestore(app, {
        databaseId: DATABASE_ID,
        experimentalForceLongPolling: true,
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });
    console.log(`[Firebase] Firestore initialized with ID: ${DATABASE_ID}`);
}

const auth = getAuth(app);
const storage = getStorage(app);

// Safety Check: In the browser
if (typeof window !== 'undefined') {
    window.__FIREBASE_DB__ = db;
}

export { app, db, auth, storage };
