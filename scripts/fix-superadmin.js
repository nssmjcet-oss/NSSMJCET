// Standalone script to set superadmin role using Firebase Admin SDK
// Uses service-account.json for credentials

const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'service-account.json'));

// Initialize Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
});

// Use the named 'default' database (NOT Firebase's standard '(default)')
const db = admin.firestore();
db.settings({ databaseId: 'default' });
const auth = admin.auth();

const SUPER_ADMIN_EMAIL = 'nssmjcet@mjcollege.ac.in';
const SUPER_ADMIN_ROLE = 'superadmin';

async function setSuperAdminRole() {
    try {
        console.log(`Looking up user: ${SUPER_ADMIN_EMAIL}`);

        // Get user by email from Firebase Auth
        const userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
        const uid = userRecord.uid;

        console.log(`✓ Found user. UID: ${uid}`);
        console.log(`Setting role "${SUPER_ADMIN_ROLE}"...`);

        // Write directly to Firestore using Admin SDK (bypasses security rules)
        await db.collection('users').doc(uid).set({
            uid,
            email: SUPER_ADMIN_EMAIL,
            role: SUPER_ADMIN_ROLE,
            createdAt: new Date().toISOString(),
        }, { merge: true });

        console.log('\n========================================');
        console.log('  SUPER ADMIN ROLE SET SUCCESSFULLY');
        console.log('========================================');
        console.log(`  Email: ${SUPER_ADMIN_EMAIL}`);
        console.log(`  UID:   ${uid}`);
        console.log(`  Role:  ${SUPER_ADMIN_ROLE}`);
        console.log('========================================\n');

        // Verify the write
        const doc = await db.collection('users').doc(uid).get();
        console.log('Verified Firestore document:', doc.data());

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.code, error.message);
        process.exit(1);
    }
}

setSuperAdminRole();
