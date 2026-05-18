require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspect() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const doc = await db.collection('content').findOne({ _id: 'live_event' });
    console.log("=== Live Event Document in Database ===");
    if (doc) {
        // Truncate the image string so it fits nicely
        const display = { ...doc };
        if (typeof display.image === 'string' && display.image.length > 200) {
            display.image = display.image.substring(0, 80) + '... [TRUNCATED ' + display.image.length + ' chars]';
        }
        console.log(JSON.stringify(display, null, 2));
    } else {
        console.log("No document with _id: 'live_event' found.");
    }

    process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
