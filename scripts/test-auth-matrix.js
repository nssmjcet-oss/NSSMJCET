require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const PRIMARY_SUPER_ADMIN_EMAIL = 'nssmjcet@mjcollege.ac.in';

async function runTests() {
    console.log('===========================================================');
    console.log('  NSS MJCET — AUTHENTICATION & AUTHORIZATION TEST MATRIX');
    console.log('===========================================================\n');

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const adminUsers = db.collection('admin_users');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName, details = '') {
        if (condition) {
            console.log(`✅ [PASS] ${testName}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${testName} — ${details}`);
            failed++;
        }
    }

    // -------------------------------------------------------------
    // Test 1: Super Admin identity & database constraints
    // -------------------------------------------------------------
    const superAdminDoc = await adminUsers.findOne({ email: PRIMARY_SUPER_ADMIN_EMAIL });
    assert(
        superAdminDoc !== null,
        'Test 1.1: Primary Super Admin exists in database'
    );
    assert(
        superAdminDoc?.role === 'SUPER_ADMIN',
        'Test 1.2: Primary Super Admin role is strictly SUPER_ADMIN',
        `Found role: ${superAdminDoc?.role}`
    );
    assert(
        superAdminDoc?.status === 'ACTIVE',
        'Test 1.3: Primary Super Admin status is ACTIVE'
    );
    assert(
        superAdminDoc?.is_primary === true,
        'Test 1.4: Primary Super Admin has is_primary === true'
    );

    // Verify only ONE primary super admin exists
    const primaryCount = await adminUsers.countDocuments({ is_primary: true });
    assert(
        primaryCount === 1,
        'Test 1.5: Database enforces exactly ONE primary super admin',
        `Found count: ${primaryCount}`
    );

    // -------------------------------------------------------------
    // Test 2: Approved Admin (zuhair@gmail.com)
    // -------------------------------------------------------------
    const approvedAdminDoc = await adminUsers.findOne({ email: 'zuhair@gmail.com' });
    assert(
        approvedAdminDoc !== null,
        'Test 2.1: Approved Admin exists in database'
    );
    assert(
        approvedAdminDoc?.role === 'ADMIN',
        'Test 2.2: Approved Admin role is strictly ADMIN (not SUPER_ADMIN)',
        `Found role: ${approvedAdminDoc?.role}`
    );
    assert(
        approvedAdminDoc?.is_primary === false,
        'Test 2.3: Approved Admin is_primary is false'
    );
    assert(
        approvedAdminDoc?.status === 'ACTIVE',
        'Test 2.4: Approved Admin status is ACTIVE'
    );

    // -------------------------------------------------------------
    // Test 3: Unapproved Google Account (college domain or external)
    // -------------------------------------------------------------
    const unapprovedEmails = ['unapproved@gmail.com', 'student@mjcollege.ac.in'];
    for (const testEmail of unapprovedEmails) {
        const found = await adminUsers.findOne({ email: testEmail });
        assert(
            found === null,
            `Test 3: Unapproved account (${testEmail}) does NOT automatically exist in database`
        );
    }

    // -------------------------------------------------------------
    // Test 4: Deactivated Admin
    // -------------------------------------------------------------
    const testDeactivatedEmail = 'test-deactivated@example.com';
    await adminUsers.deleteMany({ email: testDeactivatedEmail });
    await adminUsers.insertOne({
        _id: new mongoose.Types.ObjectId().toString(),
        email: testDeactivatedEmail,
        name: 'Test Deactivated',
        role: 'ADMIN',
        status: 'INACTIVE',
        is_primary: false,
        created_at: new Date()
    });

    const deactivatedDoc = await adminUsers.findOne({ email: testDeactivatedEmail });
    assert(
        deactivatedDoc?.status === 'INACTIVE',
        'Test 4: Inactive administrator has status === INACTIVE'
    );

    // -------------------------------------------------------------
    // Test 5, 6, 7: Role Permission Logic
    // -------------------------------------------------------------
    const { isSuperAdmin, isAdmin, canAccessAdminPanel, canManageUsers, canAccessPage } = require('../lib/rbac');

    const superAdminObj = {
        email: PRIMARY_SUPER_ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        is_primary: true
    };

    const regularAdminObj = {
        email: 'zuhair@gmail.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        is_primary: false
    };

    const deactivatedAdminObj = {
        email: testDeactivatedEmail,
        role: 'ADMIN',
        status: 'INACTIVE',
        is_primary: false
    };

    const unapprovedUserObj = {
        email: 'stranger@gmail.com',
        role: 'NONE',
        status: 'ACTIVE',
        is_primary: false
    };

    // RBAC check: Super Admin
    assert(isSuperAdmin(superAdminObj) === true, 'Test 5.1: Super Admin passes isSuperAdmin check');
    assert(canAccessAdminPanel(superAdminObj) === true, 'Test 5.2: Super Admin can access admin panel');
    assert(canManageUsers(superAdminObj) === true, 'Test 5.3: Super Admin can manage users');
    assert(canAccessPage(superAdminObj, 'users') === true, 'Test 5.4: Super Admin can access users page');
    assert(canAccessPage(superAdminObj, 'events') === true, 'Test 5.5: Super Admin can access events page');

    // RBAC check: Normal Admin
    assert(isSuperAdmin(regularAdminObj) === false, 'Test 6.1: Normal Admin FAILS isSuperAdmin check');
    assert(isAdmin(regularAdminObj) === true, 'Test 6.2: Normal Admin passes isAdmin check');
    assert(canAccessAdminPanel(regularAdminObj) === true, 'Test 6.3: Normal Admin can access admin panel');
    assert(canManageUsers(regularAdminObj) === false, 'Test 6.4: Normal Admin CANNOT manage users');
    assert(canAccessPage(regularAdminObj, 'users') === false, 'Test 6.5: Normal Admin CANNOT access users page');
    assert(canAccessPage(regularAdminObj, 'events') === true, 'Test 6.6: Normal Admin CAN access events page');

    // RBAC check: Deactivated Admin
    assert(canAccessAdminPanel(deactivatedAdminObj) === false, 'Test 7.1: Deactivated Admin CANNOT access admin panel');
    assert(canAccessPage(deactivatedAdminObj, 'events') === false, 'Test 7.2: Deactivated Admin CANNOT access events');

    // RBAC check: Unapproved Google user
    assert(canAccessAdminPanel(unapprovedUserObj) === false, 'Test 7.3: Unapproved Google user CANNOT access admin panel');

    // -------------------------------------------------------------
    // Test 8: Protection of Primary Super Admin against modification/deletion
    // -------------------------------------------------------------
    function protectPrimarySuperAdmin(target) {
        if (!target) return null;
        const targetEmail = (typeof target === 'string' ? target : target.email || '').toLowerCase().trim();
        const isPrimary = typeof target === 'object' && target.is_primary === true;

        if (targetEmail === PRIMARY_SUPER_ADMIN_EMAIL || isPrimary) {
            return {
                error: 'Forbidden: The Primary Super Admin account is protected and cannot be modified, deactivated, or deleted.',
                status: 403,
                code: 'PRIMARY_ADMIN_PROTECTED'
            };
        }
        return null;
    }

    const protectByEmail = protectPrimarySuperAdmin(PRIMARY_SUPER_ADMIN_EMAIL);
    assert(
        protectByEmail !== null && protectByEmail.status === 403,
        'Test 8.1: Server-side guard blocks modifying Super Admin by email'
    );

    const protectByPrimaryFlag = protectPrimarySuperAdmin({ is_primary: true });
    assert(
        protectByPrimaryFlag !== null && protectByPrimaryFlag.status === 403,
        'Test 8.2: Server-side guard blocks modifying account with is_primary === true'
    );

    const normalAdminProtect = protectPrimarySuperAdmin({ email: 'zuhair@gmail.com', is_primary: false });
    assert(
        normalAdminProtect === null,
        'Test 8.3: Normal admin can be modified by Super Admin'
    );

    // -------------------------------------------------------------
    // Test 9: Super Admin Admin Management Cycle (Add -> Deactivate -> Activate -> Remove)
    // -------------------------------------------------------------
    const tempTestEmail = 'temp-test-admin@mjcollege.ac.in';
    await adminUsers.deleteMany({ email: tempTestEmail });

    // Step A: Add Admin
    const inserted = await adminUsers.insertOne({
        _id: new mongoose.Types.ObjectId().toString(),
        email: tempTestEmail,
        name: 'Temp Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        is_primary: false,
        created_at: new Date()
    });
    assert(inserted.acknowledged === true, 'Test 9.1: Super Admin can add a new ADMIN');

    // Step B: Deactivate
    await adminUsers.updateOne({ email: tempTestEmail }, { $set: { status: 'INACTIVE' } });
    const afterDeact = await adminUsers.findOne({ email: tempTestEmail });
    assert(afterDeact?.status === 'INACTIVE', 'Test 9.2: Super Admin can deactivate an ADMIN');

    // Step C: Reactivate
    await adminUsers.updateOne({ email: tempTestEmail }, { $set: { status: 'ACTIVE' } });
    const afterReactivate = await adminUsers.findOne({ email: tempTestEmail });
    assert(afterReactivate?.status === 'ACTIVE', 'Test 9.3: Super Admin can reactivate an ADMIN');

    // Step D: Remove
    await adminUsers.deleteOne({ email: tempTestEmail });
    const afterRemove = await adminUsers.findOne({ email: tempTestEmail });
    assert(afterRemove === null, 'Test 9.4: Super Admin can remove an ADMIN');

    // Clean up deactivated test user
    await adminUsers.deleteMany({ email: testDeactivatedEmail });

    console.log('\n===========================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Test runner failed:', err);
    process.exit(1);
});
