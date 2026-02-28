// Use the Firebase REST API directly with the API key (same as browser SDK)
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read config from .env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
function getEnv(key) {
    const match = envContent.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : null;
}

const apiKey = getEnv('NEXT_PUBLIC_FIREBASE_API_KEY');
const projectId = getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID');

const SUPER_ADMIN_UID = 'z3VKS1U11ETzBiPw5VtojR2Zmvd2';
const SUPER_ADMIN_EMAIL = 'nssmjcet@mjcollege.ac.in';
const SUPER_ADMIN_PASSWORD = 'lakshmi@123';

function httpsRequest(url, options, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const reqOptions = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            ...options,
        };
        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    // Step 1: Sign in to get an ID token
    console.log('Step 1: Signing in to Firebase Auth...');
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const signInRes = await httpsRequest(signInUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        returnSecureToken: true
    });

    if (signInRes.status !== 200) {
        console.error('Sign-in failed:', signInRes.data);
        process.exit(1);
    }

    const idToken = signInRes.data.idToken;
    console.log('✓ Signed in successfully. UID:', signInRes.data.localId);

    // Step 2: Write the user role to Firestore using the ID token
    console.log('\nStep 2: Writing superadmin role to Firestore...');
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${SUPER_ADMIN_UID}?updateMask.fieldPaths=uid&updateMask.fieldPaths=email&updateMask.fieldPaths=role&updateMask.fieldPaths=createdAt`;

    const writeRes = await httpsRequest(firestoreUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    }, {
        fields: {
            uid: { stringValue: SUPER_ADMIN_UID },
            email: { stringValue: SUPER_ADMIN_EMAIL },
            role: { stringValue: 'superadmin' },
            createdAt: { stringValue: new Date().toISOString() }
        }
    });

    if (writeRes.status >= 200 && writeRes.status < 300) {
        console.log('\n========================================');
        console.log('  SUPER ADMIN INITIALIZED SUCCESSFULLY');
        console.log('========================================');
        console.log(`  Email:    ${SUPER_ADMIN_EMAIL}`);
        console.log(`  Password: ${SUPER_ADMIN_PASSWORD}`);
        console.log(`  UID:      ${SUPER_ADMIN_UID}`);
        console.log(`  Role:     superadmin`);
        console.log('========================================\n');
    } else {
        console.error('Firestore write failed:', writeRes.status, JSON.stringify(writeRes.data, null, 2));
        process.exit(1);
    }
}

run().then(() => process.exit(0)).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
