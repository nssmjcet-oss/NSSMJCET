// Script to list all Firestore databases in the project
// using the Firebase REST API and service account credentials

const admin = require('firebase-admin');
const path = require('path');
const https = require('https');

const serviceAccount = require(path.join(__dirname, '..', 'service-account.json'));

const app = admin.apps.length ? admin.app() : admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
});

async function listDatabases() {
    try {
        // Get access token from Admin SDK
        const token = await admin.app().options.credential.getAccessToken();
        const accessToken = token.access_token;
        const projectId = serviceAccount.project_id;

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
