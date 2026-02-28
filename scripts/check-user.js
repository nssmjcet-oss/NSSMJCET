const { initializeApp, cert, getApps, deleteApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');

const PROJECT_ID = 'nss-mjcet-website';
const UID = 'z3VKS1U11ETzBiPw5VtojR2Zmvd2';
const serviceAccountPath = 'c:/Users/sabih/Downloads/nss-mjcet-website-firebase-adminsdk-fbsvc-abbcb708bf.json';

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Service account not found at: ${serviceAccountPath}`);
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

async function promote() {
    console.log(`--- FINAL PROMOTION ATTEMPT v3 (Modular) ---`);
    console.log(`Targeting Database: 'default'`);

    try {
        const app = initializeApp({
            credential: cert(serviceAccount),
            projectId: PROJECT_ID
        }, 'diagnostic-app'); // Unique app name

        // MODULAR SYNTAX FOR DATABASE ID
        const db = getFirestore(app, 'default');
        const auth = getAuth(app);

        // Check Auth
        const user = await auth.getUser(UID);
        console.log(`✅ Auth found: ${user.email}`);

        // Write to both just in case
        console.log(`Creating record in 'users' (Plural) on database 'default'...`);
        await db.collection('users').doc(UID).set({
            email: user.email,
            role: 'superadmin',
            displayName: user.displayName || 'Super Admin',
            lastUpdated: FieldValue.serverTimestamp()
        });
        console.log(`✅ 'users' record created.`);

        console.log(`Creating record in 'user' (Singular) on database 'default'...`);
        await db.collection('user').doc(UID).set({
            email: user.email,
            role: 'superadmin',
            displayName: user.displayName || 'Super Admin',
            lastUpdated: FieldValue.serverTimestamp()
        });
        console.log(`✅ 'user' record created.`);

        console.log(`\n🎉 PROMOTION SUCCESSFUL! You are officially a Super Admin.`);

    } catch (e) {
        console.error(`❌ PROMOTION FAILED: ${e.message}`);
        if (e.message.includes('NOT_FOUND')) {
            console.log('\nDIAGNOSTIC: If it still says NOT_FOUND, the database ID is NOT "default".');
            console.log('Please check your Firebase Console -> Project Settings -> General -> Project ID.');
            console.log('Also check if you have a "Project Number" that might be needed.');
        }
    } finally {
        process.exit(0);
    }
}

promote();
