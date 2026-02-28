const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const { getFirestore } = require('firebase-admin/firestore');

// Path to service account
const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });
}

// IMPORTANT: The Firestore database is named 'default' (NOT '(default)')
const adminDb = getFirestore(admin.app(), 'default');

async function updateDevPhotos() {
    try {
        const devsRef = adminDb.collection('developers');
        const snapshot = await devsRef.get();

        console.log('Current Developers found:', snapshot.size);

        // Mapping based on user request
        const updates = [
            { namePart: 'Shaik Adnan Hyder', image: '/uploads/Shaik Adnan Hyder.jpeg' },
            { namePart: 'Mirza Zohair Ali Baigh', image: '/uploads/mirza zohair ali baig.jpeg' },
            { namePart: 'Farnaaz Munawar', image: '' }
        ];

        for (const update of updates) {
            const match = snapshot.docs.find(doc => {
                const name = doc.data().name || '';
                return name.toLowerCase().includes(update.namePart.toLowerCase());
            });

            if (match) {
                console.log(`Updating "${match.data().name}" (ID: ${match.id})...`);
                await devsRef.doc(match.id).update({ image: update.image });
                console.log(`✓ Updated with image: ${update.image || 'None'}`);
            } else {
                console.warn(`! No match found for "${update.namePart}"`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Update error:', error);
        process.exit(1);
    }
}

updateDevPhotos();
