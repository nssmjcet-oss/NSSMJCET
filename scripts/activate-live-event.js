require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function activate() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const result = await db.collection('content').updateOne(
        { _id: 'live_event' },
        { $set: { isActive: true } }
    );
    console.log("=== Activation Result ===");
    console.log(result);

    process.exit(0);
}

activate().catch(e => { console.error(e); process.exit(1); });
