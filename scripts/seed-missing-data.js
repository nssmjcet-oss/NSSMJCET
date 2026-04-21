require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function seedMissingData() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // ── 1. Program Officer ──────────────────────────────────────────────────
    const poCount = await db.collection('program-officers').countDocuments();
    if (poCount === 0) {
        console.log('Seeding: program-officers...');
        await db.collection('program-officers').insertOne({
            _id: new mongoose.Types.ObjectId().toString(),
            name:          { en: 'Dr. Laxmi', te: '', hi: '' },
            designation:   { en: 'Programme Officer, NSS MJCET', te: '', hi: '' },
            qualification: { en: '', te: '', hi: '' },
            quote:         { en: '', te: '', hi: '' },
            photo:         '',
            createdAt:     new Date(),
            updatedAt:     new Date(),
        });
        console.log('  -> program-officers seeded (update via Admin > Program Officer)');
    } else {
        console.log(`  -> program-officers already has ${poCount} doc(s), skipping.`);
    }

    // ── 2. Governing Body ───────────────────────────────────────────────────
    const gbCount = await db.collection('governing-body').countDocuments();
    if (gbCount === 0) {
        console.log('\nSeeding: governing-body...');
        await db.collection('governing-body').insertMany([
            {
                _id:         new mongoose.Types.ObjectId().toString(),
                name:        { en: 'President / Principal', te: '', hi: '' },
                designation: { en: 'Principal, MJCET', te: '', hi: '' },
                photo:       '',
                linkedin:    '',
                order:       1,
                createdAt:   new Date(),
                updatedAt:   new Date(),
            },
            {
                _id:         new mongoose.Types.ObjectId().toString(),
                name:        { en: 'Vice President', te: '', hi: '' },
                designation: { en: 'NSS MJCET', te: '', hi: '' },
                photo:       '',
                linkedin:    '',
                order:       2,
                createdAt:   new Date(),
                updatedAt:   new Date(),
            },
        ]);
        console.log('  -> governing-body seeded with 2 placeholder entries (update via Admin > Governing Body)');
    } else {
        console.log(`\n  -> governing-body already has ${gbCount} doc(s), skipping.`);
    }

    // ── 3. Stats ────────────────────────────────────────────────────────────
    const statsCount = await db.collection('stats').countDocuments();
    if (statsCount === 0) {
        console.log('\nSeeding: stats...');
        await db.collection('stats').insertOne({
            _id:           'siteStats',
            volunteers:    500,
            events:        50,
            serviceHours:  10000,
            beneficiaries: 5000,
            updatedAt:     new Date(),
        });
        console.log('  -> stats seeded with default values (update via Admin > Stats)');
    } else {
        console.log(`\n  -> stats already has ${statsCount} doc(s), skipping.`);
    }

    console.log('\n✅ Done! Seed completed successfully.');
    process.exit(0);
}

seedMissingData().catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
});
