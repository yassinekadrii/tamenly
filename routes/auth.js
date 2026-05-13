/**
 * @file routes/auth.js
 * @description Authentication routes (Registration, Login).
 */

const express = require('express');
const {
    register,
    login,
    getMe,
    updateProfile,
    updatePassword
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new patient
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user (all roles)
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged-in user (session restore for web & mobile)
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', auth, updatePassword);

module.exports = router;
