require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { adminStorage, initializeApp, cert, getApps } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const { v4: uuidv4 } = require('uuid');

// --- Initialization ---
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
const mongoUri = process.env.MONGODB_URI;

if (!getApps().length) {
    initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket
    });
}
const bucket = getStorage().bucket();

async function uploadBase64(base64String, folder) {
    if (!base64String || !base64String.startsWith('data:image')) return base64String;
    
    try {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const dataBuffer = Buffer.from(base64Data, 'base64');
        const typeMatch = base64String.match(/^data:image\/(\w+);base64,/);
        const extension = typeMatch ? typeMatch[1] : 'png';
        const fileName = `${folder}/${uuidv4()}.${extension}`;
        const file = bucket.file(fileName);

        await file.save(dataBuffer, {
            metadata: { contentType: `image/${extension}` },
        });
        await file.makePublic();
        return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    } catch (e) {
        console.error('Upload error:', e);
        return base64String;
    }
}

async function run() {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const collections = [
        { name: 'events', field: 'image', folder: 'events' },
        { name: 'team', field: 'image', folder: 'team' },
        { name: 'announcements', field: 'image', folder: 'announcements' },
        { name: 'chairman', field: 'photo', folder: 'leaders' },
        { name: 'program-officers', field: 'photo', folder: 'leaders' },
        { name: 'governing-body', field: 'photo', folder: 'governing-body' },
        { name: 'developers', field: 'image', folder: 'developers' }
    ];

    for (const coll of collections) {
        const dbColl = mongoose.connection.collection(coll.name);
        const docs = await dbColl.find({ [coll.field]: { $regex: /^data:image/ } }).toArray();
        
        console.log(`Optimizing ${docs.length} images in ${coll.name}...`);
        
        for (const doc of docs) {
            const newUrl = await uploadBase64(doc[coll.field], coll.folder);
            if (newUrl !== doc[coll.field]) {
                await dbColl.updateOne({ _id: doc._id }, { $set: { [coll.field]: newUrl } });
                process.stdout.write('.');
            }
        }
        console.log(`\nFinished ${coll.name}`);
    }

    console.log('\nMigration complete!');
    await mongoose.disconnect();
}

run().catch(console.error);
