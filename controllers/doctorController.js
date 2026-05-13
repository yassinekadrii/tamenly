/**
 * @file controllers/doctorController.js
 * @description Controller logic for doctor-specific actions.
 */

const User = require('../models/User');
const db = require('../db/mysql');

// @desc    Get patients associated with this doctor
// @route   GET /api/doctor/patients
// @access  Doctor only
const getMyPatients = async (req, res) => {
    try {
        const rows = await db.query("SELECT * FROM users WHERE role = 'patient' ORDER BY last_name ASC");
        const patients = rows.map(r => User.mapUser(r));
        res.status(200).json({ success: true, count: patients.length, patients });
    } catch (error) {
        console.error('Get doctor patients error:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des patients.', error: error.message });
    }
};

module.exports = { getMyPatients };
