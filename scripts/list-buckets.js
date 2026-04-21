require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!getApps().length) {
    initializeApp({
        credential: cert({ projectId, clientEmail, privateKey })
    });
}

async function checkBuckets() {
    const storage = getStorage();
    const buckets = [
        `${projectId}.appspot.com`,
        `${projectId}.firebasestorage.app`,
        projectId
    ];

    console.log(`Checking potential buckets for project: ${projectId}`);
    for (const bName of buckets) {
        try {
            const bucket = storage.bucket(bName);
            const [exists] = await bucket.exists();
            if (exists) {
                console.log(`✓ Bucket Found: ${bName}`);
            } else {
                console.log(`✗ Bucket Not Found: ${bName}`);
            }
        } catch (e) {
            console.log(`! Error checking ${bName}: ${e.message}`);
        }
    }
}

checkBuckets();
