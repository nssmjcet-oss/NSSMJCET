const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
const serviceAccount = require(serviceAccountPath);

// Initialize with a dummy bucket name to avoid "Bucket name not specified" error
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
    storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const storage = admin.storage();

async function checkBuckets() {
    try {
        console.log('Fetching buckets...');

        // Use the internal storage client from the bucket object
        // This is a reliable way to get to the Storage instance
        const storageClient = storage.bucket().storage;
        const [buckets] = await storageClient.getBuckets();

        console.log('Available buckets:');
        if (buckets.length === 0) {
            console.log('No buckets found! Please initialize Storage in Firebase Console.');
        }
        buckets.forEach(bucket => {
            console.log(`- ${bucket.name}`);
        });

        // Test the default one specifically
        const envBucketName = 'nss-mjcet-website.appspot.com';
        const testBucket = storage.bucket(envBucketName);
        const [exists] = await testBucket.exists();
        console.log(`Bucket ${envBucketName} exists: ${exists}`);

    } catch (err) {
        console.error('Error detail:', err);
    }
}

checkBuckets();
