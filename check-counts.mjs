import { adminDb } from './lib/firebase-admin.js';

async function checkData() {
    try {
        const vSnap = await adminDb.collection('volunteers').where('status', '==', 'approved').get();
        console.log('Approved Volunteers:', vSnap.size);

        const tSnap = await adminDb.collection('team').get();
        console.log('Team Members:', tSnap.size);

        const settingsSnap = await adminDb.collection('siteSettings').doc('main').get();
        console.log('Site Settings Data:', settingsSnap.exists ? settingsSnap.data() : 'None');

    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

checkData();
