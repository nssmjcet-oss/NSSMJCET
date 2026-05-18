require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspect() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const flagships = await db.collection('flagships').find({}).toArray();
    console.log("=== Flagship Campaigns in DB ===");
    console.log(JSON.stringify(flagships, null, 2));

    process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
