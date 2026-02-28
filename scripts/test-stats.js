const { initializeApp, cert, getApps, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'nss-mjcet-website';
const serviceAccountPath = 'c:/Users/sabih/Downloads/nss-mjcet-website-firebase-adminsdk-fbsvc-5d2adf112a.json';

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Service account not found at: ${serviceAccountPath}`);
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

async function testDatabases() {
    const dbsToTest = ['(default)', 'default'];

    for (const dbName of dbsToTest) {
        console.log(`\n--- Testing Database: "${dbName}" ---`);
        try {
            // Cleanup existing app if any
            const existingApps = getApps();
            for (const app of existingApps) {
                await deleteApp(app);
            }

            const app = initializeApp({
                credential: cert(serviceAccount),
                projectId: PROJECT_ID
            }, 'test-app-' + Date.now());

            const db = getFirestore(app, dbName);

            const users = await db.collection('users').get();
            const events = await db.collection('events').get();
            const volunteers = await db.collection('volunteers').get();

            console.log(`✅ Connection successful.`);
            console.log(`📊 Users: ${users.size}`);
            console.log(`📊 Events: ${events.size}`);
            console.log(`📊 Volunteers: ${volunteers.size}`);

        } catch (e) {
            console.error(`❌ Error testing "${dbName}": ${e.message}`);
        }
    }
}

testDatabases().then(() => console.log('\nTest complete.'));
