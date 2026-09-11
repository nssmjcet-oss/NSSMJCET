require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const SUPER_ADMIN_EMAIL = 'nssmjcet@mjcollege.ac.in';

async function migrate() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('Missing MONGODB_URI');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const adminUsersColl = db.collection('admin_users');
    const legacyUsersColl = db.collection('users');

    // Create indexes on admin_users
    await adminUsersColl.createIndex({ email: 1 }, { unique: true });
    await adminUsersColl.createIndex({ google_uid: 1 }, { sparse: true });
    await adminUsersColl.createIndex({ uid: 1 }, { sparse: true });
    await adminUsersColl.createIndex({ role: 1, status: 1 });

    console.log('Indexes created successfully.');

    // 1. Ensure Primary Super Admin exists and is protected
    const existingSuperAdmin = await adminUsersColl.findOne({ email: SUPER_ADMIN_EMAIL });
    
    // Check if legacy users collection had super admin info
    const legacySuperAdmin = await legacyUsersColl.findOne({ email: SUPER_ADMIN_EMAIL });
    const superAdminUid = legacySuperAdmin?.uid || legacySuperAdmin?._id || 'z3VKS1U11ETzBiPw5VtojR2Zmvd2';

    if (!existingSuperAdmin) {
        console.log(`Creating Primary Super Admin: ${SUPER_ADMIN_EMAIL}...`);
        await adminUsersColl.insertOne({
            _id: new mongoose.Types.ObjectId().toString(),
            uid: superAdminUid,
            google_uid: superAdminUid,
            email: SUPER_ADMIN_EMAIL,
            name: legacySuperAdmin?.displayName || 'NSS MJCET Super Admin',
            photo_url: legacySuperAdmin?.photo_url || '',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            is_primary: true,
            created_at: legacySuperAdmin?.createdAt ? new Date(legacySuperAdmin.createdAt) : new Date(),
            updated_at: new Date(),
            last_login: legacySuperAdmin?.lastLogin ? new Date(legacySuperAdmin.lastLogin) : null
        });
        console.log('✅ Primary Super Admin created.');
    } else {
        console.log(`Updating Primary Super Admin record for ${SUPER_ADMIN_EMAIL}...`);
        await adminUsersColl.updateOne(
            { email: SUPER_ADMIN_EMAIL },
            {
                $set: {
                    role: 'SUPER_ADMIN',
                    status: 'ACTIVE',
                    is_primary: true,
                    updated_at: new Date()
                }
            }
        );
        console.log('✅ Primary Super Admin updated and locked.');
    }

    // Ensure NO OTHER user has is_primary: true or role: SUPER_ADMIN
    const demoteOthersResult = await adminUsersColl.updateMany(
        { email: { $ne: SUPER_ADMIN_EMAIL }, $or: [{ is_primary: true }, { role: 'SUPER_ADMIN' }] },
        {
            $set: {
                role: 'ADMIN',
                is_primary: false,
                updated_at: new Date()
            }
        }
    );
    if (demoteOthersResult.modifiedCount > 0) {
        console.log(`⚠️ Demoted ${demoteOthersResult.modifiedCount} invalid non-primary superadmin(s) to ADMIN.`);
    }

    // 2. Migrate any other existing admins from legacy users collection
    const legacyAdmins = await legacyUsersColl.find({ email: { $ne: SUPER_ADMIN_EMAIL } }).toArray();
    console.log(`Found ${legacyAdmins.length} legacy account(s) to migrate.`);

    for (const legacy of legacyAdmins) {
        if (!legacy.email) continue;
        const normalizedEmail = legacy.email.toLowerCase().trim();
        const existing = await adminUsersColl.findOne({ email: normalizedEmail });

        if (!existing) {
            console.log(`Migrating legacy admin: ${normalizedEmail}...`);
            await adminUsersColl.insertOne({
                _id: new mongoose.Types.ObjectId().toString(),
                uid: legacy.uid || legacy._id,
                google_uid: legacy.uid || legacy._id,
                email: normalizedEmail,
                name: legacy.name || legacy.displayName || '',
                photo_url: legacy.photo_url || legacy.profilePicture || '',
                role: 'ADMIN',
                status: 'ACTIVE',
                is_primary: false,
                created_at: legacy.createdAt ? new Date(legacy.createdAt) : new Date(),
                updated_at: new Date(),
                last_login: legacy.lastLogin ? new Date(legacy.lastLogin) : null
            });
            console.log(`✅ Migrated: ${normalizedEmail}`);
        } else {
            console.log(`Account ${normalizedEmail} already exists in admin_users.`);
        }
    }

    // Print all administrators
    const allAdmins = await adminUsersColl.find({}).toArray();
    console.log('\n=== CURRENT ADMIN_USERS IN MONGODB ===');
    allAdmins.forEach(u => {
        console.log(`- ${u.email} | Role: ${u.role} | Status: ${u.status} | Primary: ${u.is_primary}`);
    });

    console.log('\nMigration complete.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
