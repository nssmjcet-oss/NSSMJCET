require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
}

const db = admin.firestore();

async function listCollections() {
    try {
        const collections = await db.listCollections();
        console.log('--- FIRESTORE COLLECTIONS ---');
        for (const c of collections) {
            console.log(c.id);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

listCollections();
