const { adminAuth } = require('./lib/firebase-admin');

async function verifyAuthUser() {
    try {
        const email = 'nssmjcet@mjcollege.ac.in';
        console.log(`--- Fetching user for: ${email} ---`);
        try {
            const userRecord = await adminAuth.getUserByEmail(email);
            console.log('REAL AUTH USER:');
            console.log(`UID: [${userRecord.uid}]`);
            console.log(`Display Name: [${userRecord.displayName}]`);
            console.log(`Role Claims:`, JSON.stringify(userRecord.customClaims || {}, null, 2));
            console.log(`UID Length: ${userRecord.uid.length}`);

            // Check for hidden characters
            console.log('UID Code Points:', Array.from(userRecord.uid).map(c => c.charCodeAt(0)));
        } catch (e) {
            console.log('User not found by email in Auth.');
        }

        console.log('\n--- Listing all users in Auth (first 10) ---');
        const listUsers = await adminAuth.listUsers(10);
        listUsers.users.forEach(u => {
            console.log(`UID: [${u.uid}] | Email: [${u.email}]`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyAuthUser();
