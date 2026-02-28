const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// service-account.json is in the root
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
const serviceAccount = require(serviceAccountPath);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        projectId: 'nss-mjcet-website'
    });
}

const db = getFirestore(undefined, 'default');

async function listUsers() {
    try {
        console.log('--- Listing Users in "users" collection (database: default) ---');
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            console.log('No users found.');
            return;
        }

        snapshot.forEach(doc => {
            console.log(`UID: ${doc.id}`);
            console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
            console.log('---');
        });
    } catch (err) {
        console.error('Error listing users:', err.message);
    }
}

listUsers();
