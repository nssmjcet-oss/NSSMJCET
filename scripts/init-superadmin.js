// This script uses the client-side Firebase SDK (which is already working)
// to create the Super Admin account and set the role in Firestore.

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Read config from .env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
function getEnv(key) {
    const match = envContent.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : null;
}

const firebaseConfig = {
    apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SUPER_ADMIN_EMAIL = 'nssmjcet@mjcollege.ac.in';
const SUPER_ADMIN_PASSWORD = 'lakshmi@123';

async function initSuperAdmin() {
    try {
        console.log(`Initializing Super Admin: ${SUPER_ADMIN_EMAIL}`);

        let userCredential;
        try {
            // Try to create a new user
            userCredential = await createUserWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
            console.log('✓ New user created in Firebase Auth.');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                // User already exists, sign in instead
                console.log('User already exists, signing in...');
                userCredential = await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
                console.log('✓ Signed in to existing account.');
            } else {
                throw error;
            }
        }

        const user = userCredential.user;
        console.log(`Setting role "superadmin" for UID: ${user.uid}`);

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: SUPER_ADMIN_EMAIL,
            role: 'superadmin',
            createdAt: new Date().toISOString()
        }, { merge: true });

        console.log('✓ Super Admin role set in Firestore.');
        console.log('\n========================================');
        console.log('  SUPER ADMIN INITIALIZED SUCCESSFULLY');
        console.log('========================================');
        console.log(`  Email:    ${SUPER_ADMIN_EMAIL}`);
        console.log(`  Password: ${SUPER_ADMIN_PASSWORD}`);
        console.log(`  UID:      ${user.uid}`);
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error initializing Super Admin:', error.code, error.message);
        process.exit(1);
    }
}

initSuperAdmin();
