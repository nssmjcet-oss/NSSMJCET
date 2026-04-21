// scripts/migrate-to-mongodb.js
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const mongoose = require('mongoose');

// --- 1. Load environment variables manually without dotenv ---
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        // Find the first equals sign to split key/value correctly
        const equalIndex = line.indexOf('=');
        if (equalIndex > -1) {
            let key = line.substring(0, equalIndex).trim();
            let val = line.substring(equalIndex + 1).trim();
            // Remove surrounding quotes if they exist
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            if (val.startsWith("'") && val.endsWith("'")) {
                val = val.substring(1, val.length - 1);
            }
            process.env[key] = val;
        }
    });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("FATAL: MONGODB_URI not found in .env.local");
    process.exit(1);
}

// --- 2. Initialize Firebase ---
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (!projectId || !clientEmail || !privateKey) {
        console.error("FATAL: Missing Firebase credentials in .env.local");
        process.exit(1);
    }

    const cleanedKey = privateKey
        .replace(/\\n/g, '\n')
        .replace(/^['"]|['"]$/g, '')
        .trim();

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: cleanedKey,
        }),
    });
}
const { getFirestore } = require('firebase-admin/firestore');
const firestore = getFirestore(admin.app(), 'default');

// --- 3. Run Migration ---
async function migrateData() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB successfully!");

    // List of collections we want to migrate
    const collectionsToMigrate = [
        'events',
        'announcements',
        'developers',
        'program-officers',
        'volunteers',
        'portals',
        'governing-body',
        'chairman',
        'stats',
        'contacts',
        'users',
        'content',
        'team'
    ];

    for (const collectionName of collectionsToMigrate) {
        console.log(`\nStarting migration for [${collectionName}]...`);
        try {
            const snapshot = await firestore.collection(collectionName).get();
            const firestoreCount = snapshot.docs.length;

            if (firestoreCount === 0) {
                console.log(`  -> Skipping [${collectionName}]: 0 documents found in Firestore.`);
                continue;
            }
            console.log(`  -> Found ${firestoreCount} documents in Firestore.`);

            // Prepare for MongoDB insertion
            const dbCollection = mongoose.connection.collection(collectionName);

            // Clear existing data in MongoDB to avoid duplicates if run multiple times
            await dbCollection.deleteMany({});
            console.log(`  -> Cleared existing data in MongoDB for [${collectionName}].`);

            // Build array of documents
            const docsToInsert = snapshot.docs.map(doc => {
                const data = doc.data();

                // Convert Firestore Timestamps to native JavaScript Dates so MongoDB handles them properly
                Object.keys(data).forEach(key => {
                    if (data[key] && typeof data[key].toDate === 'function') {
                        data[key] = data[key].toDate();
                    }
                });

                // Attach original Firestore ID as _id so URLs and references don't break
                return { _id: doc.id, ...data };
            });

            // Insert into MongoDB
            await dbCollection.insertMany(docsToInsert);
            console.log(`  -> Successfully migrated ${docsToInsert.length} documents for [${collectionName}]!`);

        } catch (err) {
            console.error(`  -> ERROR migrating collection [${collectionName}]:`, err.message);
        }
    }

    console.log("\n===== MIGRATION COMPLETE =====");
    process.exit(0);
}

migrateData().catch(console.error);
