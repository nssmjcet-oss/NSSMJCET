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

async function inspectFirestore() {
    try {
        const collections = await db.listCollections();
        console.log('--- FIRESTORE INSPECTION ---');
        for (const c of collections) {
            const snap = await c.limit(1).get();
            if (!snap.empty) {
                console.log(`Collection: ${c.id}`);
                console.log(`Data (1st doc):`, JSON.stringify(snap.docs[0].data()).substring(0, 200));
            } else {
                console.log(`Collection: ${c.id} (Empty)`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

inspectFirestore();
