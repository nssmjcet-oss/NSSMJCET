const { adminDb } = require('../lib/firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifySuperAdmin() {
    const uid = 'z3VKS1U11ETzBiPw5VtojR2Zmvd2';
    console.log(`Checking Firestore for UID: ${uid}...`);

    try {
        const doc = await adminDb.collection('users').doc(uid).get();
        if (!doc.exists) {
            console.error('❌ ERROR: No document found in Firestore with ID: ' + uid);
            console.log('Available documents in "users" collection:');
            const snapshot = await adminDb.collection('users').get();
            snapshot.forEach(d => console.log(' - ' + d.id));
            return;
        }

        const data = doc.data();
        console.log('✅ Document found!');
        console.log('Data:', JSON.stringify(data, null, 2));

        if (data.role === 'superadmin') {
            console.log('🚀 Role is correctly set to "superadmin"');
        } else {
            console.error(`❌ ERROR: Role is set to "${data.role}" but should be "superadmin"`);
        }
    } catch (error) {
        console.error('❌ ERROR checking Firestore:', error.message);
    }
}

verifySuperAdmin().then(() => process.exit());
