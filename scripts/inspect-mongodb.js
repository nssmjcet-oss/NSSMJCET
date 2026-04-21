require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspect() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // List all collections and their data
    const colls = await db.listCollections().toArray();
    for (const c of colls) {
        const docs = await db.collection(c.name).find({}).toArray();
        console.log(`\n=== ${c.name} (${docs.length} docs) ===`);
        for (const d of docs) {
            // Show doc but truncate long base64 strings
            const display = {};
            for (const [k, v] of Object.entries(d)) {
                if (typeof v === 'string' && v.length > 200) {
                    display[k] = v.substring(0, 80) + '... [TRUNCATED ' + v.length + ' chars]';
                } else {
                    display[k] = v;
                }
            }
            console.log(JSON.stringify(display, null, 2));
        }
    }

    process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
