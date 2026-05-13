/**
 * @file scripts/createTestAccounts.js
 * @description Creates specific test accounts (marie, patient1, admin) for PsyConnect.
 */

const User = require('../models/User');

const createAccounts = async () => {
    try {
        console.log('✅ Connecté à MySQL');

        const accounts = [
            {
                firstName: 'Mohammed',
                lastName: 'Doctor',
                email: 'mohammed',
                phone: '+33600000001',
                password: '1',
                role: 'doctor',
                isSuperAdmin: false,
                isVerified: true,
                specialty: 'Psychologue Clinicien',
                bio: 'Je suis Dr. Mohammed.'
            },
            {
                firstName: 'Patient',
                lastName: 'One',
                email: 'patient1',
                phone: '+33600000002',
                password: '1',
                role: 'patient',
                isSuperAdmin: false,
                isVerified: true
            },
            {
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin',
                phone: '+33600000000',
                password: 'admin',
                role: 'admin',
                isSuperAdmin: true,
                isVerified: true
            }
        ];

        for (const account of accounts) {
            const existing = await User.findOneByEmail(account.email);
            if (!existing) {
                await User.create(account);
                console.log(`✅ Compte créé: ${account.email} / ${account.password} (${account.role})`);
            } else {
                // If it exists, update the password to make sure it matches what the user expects
                await User.updatePassword(existing.id, account.password);
                console.log(`ℹ️ Compte mis à jour (mot de passe réinitialisé): ${account.email} / ${account.password} (${account.role})`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
};

createAccounts();
