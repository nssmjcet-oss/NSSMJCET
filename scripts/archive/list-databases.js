// Script to list all Firestore databases in the project
// using the Firebase REST API and service account credentials

const admin = require('firebase-admin');
const path = require('path');
const https = require('https');

// --- Load environment variables manually ---
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const equalIndex = line.indexOf('=');
        if (equalIndex > -1) {
            let key = line.substring(0, equalIndex).trim();
            let val = line.substring(equalIndex + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
            process.env[key] = val;
        }
    });
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (!projectId || !clientEmail || !privateKey) {
        console.error("FATAL: Missing Firebase credentials in .env.local");
        process.exit(1);
    }
    const cleanedKey = privateKey.replace(/\\n/g, '\n').replace(/^['"]|['"]$/g, '').trim();
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: cleanedKey,
        }),
    });
}

async function listDatabases() {
    try {
        // Get access token from Admin SDK
        const token = await admin.app().options.credential.getAccessToken();
        const accessToken = token.access_token;
        // Use the projectId variable we defined earlier
        console.log('Project ID:', projectId);
        console.log('Listing Firestore databases...\n');

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'firestore.googleapis.com',
                path: `/v1/projects/${projectId}/databases`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    const parsed = JSON.parse(data);
                    if (parsed.databases) {
                        console.log('Found databases:');
                        parsed.databases.forEach(db => {
                            console.log('  -', db.name);
                            console.log('    Location:', db.locationId);
                            console.log('    Type:', db.type);
                        });
                    } else {
                        console.log('Response:', JSON.stringify(parsed, null, 2));
                    }
                    resolve();
                });
            });

            req.on('error', reject);
            req.end();
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listDatabases().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
