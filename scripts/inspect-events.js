require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspect() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const events = await db.collection('events').find({}).toArray();
    console.log(`=== Total Events: ${events.length} ===`);
    for (const d of events) {
        console.log({
            _id: d._id,
            title: d.title?.en || d.title || 'No Title',
            eventType: d.eventType,
            status: d.status,
            date: d.date,
            isLive: d.isLive,
            live: d.live,
            featured: d.featured,
            type: d.type,
            academicYear: d.academicYear,
            hasImages: Array.isArray(d.images) ? d.images.length : 0
        });
    }

    process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
