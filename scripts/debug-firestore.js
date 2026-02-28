// Debug script to check Firestore connectivity and list databases
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'service-account.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function debug() {
    try {
        // Try listing collections first
        console.log('Listing root collections...');
        const collections = await db.listCollections();
        console.log('Collections found:', collections.map(c => c.id));

        // Try reading from an existing collection
        console.log('\nTrying to read from "events" collection...');
        const snapshot = await db.collection('events').limit(1).get();
        console.log('Events docs:', snapshot.size);

        // Now try writing
        console.log('\nTrying to write superadmin role...');
        await db.collection('users').doc('z3VKS1U11ETzBiPw5VtojR2Zmvd2').set({
            uid: 'z3VKS1U11ETzBiPw5VtojR2Zmvd2',
            email: 'nssmjcet@mjcollege.ac.in',
            role: 'superadmin',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✓ Write successful!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.code, error.message);
        process.exit(1);
    }
}

debug();
