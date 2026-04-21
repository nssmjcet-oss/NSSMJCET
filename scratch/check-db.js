import connectToDatabase from './lib/mongodb.js';
import { GoverningBody } from './lib/models.js';

async function checkDB() {
    await connectToDatabase();
    console.log('--- Governing Body Members ---');
    const members = await GoverningBody.find({}).lean();
    members.forEach(m => {
        console.log(`ID: "${m._id}" (Type: ${typeof m._id})`);
    });
    process.exit(0);
}

checkDB();
