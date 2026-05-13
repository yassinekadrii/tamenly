/**
 * @file controllers/adminController.js
 * @description Controller logic for administrative actions.
 */

const User = require('../models/User');
const Message = require('../models/Message');
const Prescription = require('../models/Prescription');
const db = require('../db/mysql');

const fs = require('fs');

const logToDebug = (message) => {
    fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] ${message}\n`);
    console.log(message);
};

// @desc    Create a new doctor account
// @route   POST /api/admin/create-doctor
// @access  Admin only
const createDoctor = async (req, res) => {
    fs.appendFileSync('api-debug.log', `[${new Date().toISOString()}] ENTERING createDoctor\n`);
    try {
        const { firstName, lastName, email, phone, password, specialty, location } = req.body;

        const missing = [];
        if (!firstName) missing.push('Prénom');
        if (!lastName) missing.push('Nom');
        if (!email) missing.push('Email');
        if (!phone) missing.push('Téléphone');
        if (!password) missing.push('Mot de passe');

        if (missing.length > 0) {
            return res.status(400).json({ success: false, message: `Les champs suivants sont requis : ${missing.join(', ')}` });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }

        const existingUser = await User.findOneByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Un utilisateur avec cet email existe déjà.' });
        }

        const doctor = await User.create({
            firstName, lastName, email, phone, password,
            specialty: specialty || '',
            location: location || '',
            role: 'doctor',
            isVerified: true
        });

        res.status(201).json({
            success: true,
            message: 'Compte médecin créé avec succès.',
            doctor: {
                id: doctor.id,
                firstName, lastName, email, phone,
                role: 'doctor',
                specialty: specialty || '',
                location: location || ''
            }
        });
    } catch (error) {
        console.error('[createDoctor] Catch Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé par un autre compte.' });
        }
        res.status(500).json({ success: false, message: 'Erreur lors de la création du compte médecin.', error: error.message });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin only
const getDashboardStats = async (req, res) => {
    logToDebug(`[${req.user.email}] ENTERING getDashboardStats`);
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

        const [{ count: totalPatients }] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'patient'");
        const [{ count: totalDoctors }] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'doctor'");
        const [{ count: totalUsers }] = await db.query("SELECT COUNT(*) as count FROM users");
        const [{ count: totalMessages }] = await db.query("SELECT COUNT(*) as count FROM messages");
        const [{ count: totalPrescriptions }] = await db.query("SELECT COUNT(*) as count FROM prescriptions");
        const [{ count: recentPatients }] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'patient' AND created_at >= ?", [thirtyDaysAgoStr]);
        const [{ count: recentDoctors }] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'doctor' AND created_at >= ?", [thirtyDaysAgoStr]);

        res.status(200).json({
            success: true,
            stats: { totalPatients, totalDoctors, totalUsers, totalMessages, totalPrescriptions, recentPatients, recentDoctors }
        });
    } catch (error) {
        console.error('Dashboard stats crash error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques.', error: error.message });
    }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Admin only
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.findDoctors();
        res.status(200).json({ success: true, count: doctors.length, doctors });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des médecins.', error: error.message });
    }
};

// @desc    Delete a doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Admin only
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Médecin non trouvé.' });
        if (doctor.role !== 'doctor') return res.status(400).json({ success: false, message: "Cet utilisateur n'est pas un médecin." });

        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: 'Médecin supprimé avec succès.' });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression du médecin.', error: error.message });
    }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Admin only
const getAllPatients = async (req, res) => {
    try {
        const rows = await db.query("SELECT * FROM users WHERE role = 'patient' ORDER BY created_at DESC");
        const patients = rows.map(r => User.mapUser(r));
        res.status(200).json({ success: true, count: patients.length, patients });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des patients.', error: error.message });
    }
};

// @desc    Delete a patient
// @route   DELETE /api/admin/patients/:id
// @access  Admin only
const deletePatient = async (req, res) => {
    try {
        const patient = await User.findById(req.params.id);
        if (!patient) return res.status(404).json({ success: false, message: 'Patient non trouvé.' });
        if (patient.role !== 'patient') return res.status(400).json({ success: false, message: "Cet utilisateur n'est pas un patient." });

        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: 'Patient supprimé avec succès.' });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression du patient.', error: error.message });
    }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Super Admin only
const getAllAdmins = async (req, res) => {
    try {
        const rows = await db.query("SELECT * FROM users WHERE role = 'admin' AND id != ? ORDER BY created_at DESC", [req.user.id]);
        const admins = rows.map(r => User.mapUser(r));
        res.status(200).json({ success: true, count: admins.length, admins });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des administrateurs.', error: error.message });
    }
};

// @desc    Delete an admin
// @route   DELETE /api/admin/admins/:id
// @access  Super Admin only
const deleteAdmin = async (req, res) => {
    try {
        const adminToDelete = await User.findById(req.params.id);
        if (!adminToDelete) return res.status(404).json({ success: false, message: 'Administrateur non trouvé.' });
        if (adminToDelete.role !== 'admin') return res.status(400).json({ success: false, message: "Cet utilisateur n'est pas un administrateur." });

        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: 'Administrateur supprimé avec succès.' });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'administrateur.", error: error.message });
    }
};

module.exports = { createDoctor, getDashboardStats, getAllDoctors, deleteDoctor, getAllPatients, deletePatient, getAllAdmins, deleteAdmin };
