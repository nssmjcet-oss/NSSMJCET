require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function fixStats() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    await db.collection('stats').updateOne(
        { _id: 'siteStats' },
        { $set: { serviceHours: 10000, peopleBenefited: 5000, volunteers: 500, events: 50 } }
    );
    
    console.log('Stats document updated with correct field names!');
    const doc = await db.collection('stats').findOne({ _id: 'siteStats' });
    console.log('Updated doc:', JSON.stringify(doc));
    
    process.exit(0);
}

fixStats().catch(e => { console.error(e); process.exit(1); });
