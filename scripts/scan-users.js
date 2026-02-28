const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
const serviceAccount = require(serviceAccountPath);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        projectId: 'nss-mjcet-website'
    });
}

// Check both 'default' and '(default)' just in case
const dbIds = ['default', '(default)'];

async function scan() {
    for (const dbId of dbIds) {
        try {
            console.log(`\n=== SCANNING DATABASE: ${dbId} ===`);
            const db = getFirestore(undefined, dbId);

            // Check 'users'
            console.log('Checking "users" (plural)...');
            const usersSnap = await db.collection('users').get();
            usersSnap.forEach(doc => {
                console.log(`[users] UID: ${doc.id}, Role: ${doc.data().role}, Email: ${doc.data().email}`);
            });

            // Check 'user'
            console.log('Checking "user" (singular)...');
            const userSnap = await db.collection('user').get();
            userSnap.forEach(doc => {
                console.log(`[user] UID: ${doc.id}, Role: ${doc.data().role}, Email: ${doc.data().email}`);
            });

        } catch (err) {
            console.warn(`Could not access db ${dbId}: ${err.message}`);
        }
    }
}

scan();
