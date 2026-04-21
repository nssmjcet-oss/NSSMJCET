require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function verifyData() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- MIGRATION VERIFICATION REPORT ---');
    
    const collections = [
        { name: 'events', imageField: 'images' },
        { name: 'team', imageField: 'image' },
        { name: 'announcements', imageField: 'imageUrl' },
        { name: 'developers', imageField: 'image' },
        { name: 'chairman', imageField: 'photo' }
    ];

    for (const coll of collections) {
        const dbColl = mongoose.connection.collection(coll.name);
        const count = await dbColl.countDocuments();
        
        let sample;
        if (coll.imageField === 'images') {
             sample = await dbColl.findOne({ images: { $exists: true, $not: { $size: 0 } } });
        } else {
             sample = await dbColl.findOne({ [coll.imageField]: { $exists: true, $ne: '' } });
        }

        console.log(`Collection: ${coll.name.padEnd(15)} | Count: ${String(count).padStart(3)} | Image Status: ${sample ? '✓ Loaded' : '✗ No images found'}`);
        if (sample) {
            const imgVal = coll.imageField === 'images' ? sample.images[0] : sample[coll.imageField];
            if (imgVal.startsWith('data:image')) {
                console.log(`   └─ Type: Base64 string (${imgVal.substring(0, 30)}...)`);
            } else if (imgVal.startsWith('http')) {
                console.log(`   └─ Type: External URL`);
            }
        }
    }

    console.log('------------------------------------');
    await mongoose.disconnect();
}

verifyData().catch(console.error);
