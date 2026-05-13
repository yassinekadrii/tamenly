/**
 * @file scripts/seedAdmin.js
 * @description Script to seed initial administrative users into the database using MySQL.
 * Useful for initializing the platform after a clean database setup.
 */

const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Admin credentials
const ADMIN_DATA = {
    firstName: 'Admin',
    lastName: 'PsyConnect',
    email: 'admin',
    phone: '+33 6 00 00 00 00',
    password: 'hello',
    role: 'admin',
    isSuperAdmin: true,
    isVerified: true
};

const seedAdmin = async () => {
    try {
        console.log('✅ Connecté à MySQL (via le modèle User)');

        // Check if admin already exists
        const existingAdmin = await User.findOneByEmail(ADMIN_DATA.email);

        if (existingAdmin) {
            console.log('ℹ️  Un compte admin existe déjà avec cet email');
            console.log('📧 Email:', ADMIN_DATA.email);
            process.exit(0);
        }

        // Create admin user
        await User.create(ADMIN_DATA);

        console.log('✅ Compte admin créé avec succès!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', ADMIN_DATA.email);
        console.log('🔑 Mot de passe:', ADMIN_DATA.password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la création du compte admin:', error);
        process.exit(1);
    }
};

// Run the seed function
seedAdmin();
