/**
 * @file controllers/authController.js
 * @description Controller for user authentication (Register, Login).
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Attempt = require('../models/Attempt');

/**
 * Helper to log access attempts
 */
const logAttempt = async (req, email, type, status, message = '') => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        await Attempt.create({
            email,
            ip,
            userAgent,
            type,
            status,
            message
        });
    } catch (err) {
        console.error('Failed to log attempt:', err);
    }
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    const fs = require('fs');
    fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] ENTERING register for ${req.body.email}\n`);
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOneByEmail(email);
        if (existingUser) {
            await logAttempt(req, email, 'register', 'fail', 'Cet email est déjà utilisé');
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà.'
            });
        }

        // Create new patient (force role to patient, auto-verify)
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'patient',
            isVerified: true
        });

        await logAttempt(req, email, 'register', 'success');

        // Generate token immediately
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie.',
            token,
            isVerified: true,
            user: {
                id: user.id,
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription.',
            error: error.message
        });
    }
};

// @desc    Login user (all roles)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const fs = require('fs');
        fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN ATTEMPT: ${email}\n`);

        // Validate required fields
        if (!email || !password) {
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN FAIL: Missing fields\n`);
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis.'
            });
        }

        // Find user
        const user = await User.findOneByEmail(email);

        if (!user) {
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN FAIL: User not found: ${email}\n`);
            await logAttempt(req, email, 'login', 'fail', 'Utilisateur non trouvé');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN PROCEEDING: Password check for ${email}\n`);

        // Check password
        const isPasswordValid = await User.comparePassword(password, user.password);

        if (!isPasswordValid) {
            fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN FAIL: Invalid password: ${email}\n`);
            await logAttempt(req, email, 'login', 'fail', 'Mot de passe incorrect');
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] LOGIN SUCCESS: ${email}\n`);
        // Generate token
        const token = generateToken(user.id);
        await logAttempt(req, email, 'login', 'success');

        console.log('Login successful, sending response');
        res.status(200).json({
            success: true,
            message: 'Connexion réussie.',
            token,
            user: {
                id: user.id,
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture || '',
                certification: user.certification || '',
                cv: user.cv || '',
                bio: user.bio || '',
                specialty: user.specialty || '',
                availability: user.availability || '',
                location: user.location || '',
                consultationMode: user.consultationMode || 'online'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion.',
            error: error.message
        });
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user is already populated by the auth middleware
        const user = req.user; // Note: Ensure middleware maps db fields to camelCase or use raw
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin,
                profilePicture: user.profilePicture || '',
                certification: user.certification || '',
                cv: user.cv || '',
                bio: user.bio || '',
                specialty: user.specialty || '',
                availability: user.availability || '',
                location: user.location || '',
                consultationMode: user.consultationMode || 'online',
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil.'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, bio, specialty, location, consultationMode } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Update fields if provided
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phone) updateData.phone = phone;
        if (bio !== undefined) updateData.bio = bio;
        if (specialty) updateData.specialty = specialty;
        if (location) updateData.location = location;
        if (consultationMode) updateData.consultationMode = consultationMode;

        await User.update(user.id, updateData);

        // Fetch updated user
        const updatedUser = await User.findById(user.id);

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: {
                id: updatedUser.id,
                _id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture || '',
                bio: updatedUser.bio || '',
                specialty: updatedUser.specialty || '',
                location: updatedUser.location || '',
                consultationMode: updatedUser.consultationMode || 'online'
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil' });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis' });
        }

        const user = await User.findById(req.user.id);

        const isMatch = await User.comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
        }

        await User.updatePassword(user.id, newPassword);

        res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du mot de passe' });
    }
};

module.exports = { register, login, getMe, updateProfile, updatePassword };
