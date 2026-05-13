/**
 * @file scripts/createTestAccounts.js
 * @description Script to create specific test accounts requested by the user.
 */

const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const ACCOUNTS = [
    {
        firstName: 'Doctor',
        lastName: 'Momo',
        email: 'momo',
        password: '1',
        role: 'doctor',
        isVerified: true
    },
    {
        firstName: 'Patient',
        lastName: 'Test',
        email: 'patient',
        password: '1',
        role: 'patient',
        isVerified: true
    },
    {
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin',
        password: 'admin',
        role: 'admin',
        isSuperAdmin: true,
        isVerified: true
    }
];

const createAccounts = async () => {
    try {
        console.log('🚀 Initializing test accounts creation...');

        for (const accountData of ACCOUNTS) {
            const existing = await User.findOneByEmail(accountData.email);
            if (existing) {
                console.log(`ℹ️  Account already exists: ${accountData.email}`);
                continue;
            }

            await User.create(accountData);
            console.log(`✅ Created ${accountData.role}: ${accountData.email} / ${accountData.password}`);
        }

        console.log('✨ All accounts processed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating accounts:', error);
        process.exit(1);
    }
};

createAccounts();
