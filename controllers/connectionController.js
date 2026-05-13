/**
 * @file controllers/connectionController.js
 * @description Controller for patient-doctor connection requests.
 */

const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Request a connection (Patient to Doctor)
// @route   POST /api/connections/request
// @access  Patient
exports.requestConnection = async (req, res) => {
    try {
        const { doctorId } = req.body;
        const patientId = req.user.id;

        if (req.user.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Seuls les patients peuvent demander une connexion' });
        }

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Médecin non trouvé' });
        }

        const existing = await Connection.findOne(patientId, doctorId);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Une demande existe déjà ou vous êtes déjà connecté/bloqué' });
        }

        const connection = await Connection.create(patientId, doctorId, 'accepted', 'patient');
        res.status(201).json({ success: true, message: 'Connexion établie', connection });
    } catch (error) {
        console.error('Error requesting connection:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Accept a connection (Doctor only)
// @route   PUT /api/connections/accept/:patientId
// @access  Doctor
exports.acceptConnection = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        if (!patientId || patientId === 'undefined') {
            return res.status(400).json({ success: false, message: 'ID patient invalide' });
        }

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Seuls les médecins peuvent accepter une connexion' });
        }

        const connection = await Connection.findOne(patientId, doctorId);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Demande non trouvée' });
        }

        await Connection.updateStatus(patientId, doctorId, 'accepted');
        res.json({ success: true, message: 'Connexion acceptée' });
    } catch (error) {
        console.error('Error accepting connection:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Block a patient (Doctor only)
// @route   PUT /api/connections/block/:patientId
// @access  Doctor
exports.blockConnection = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        if (!patientId || patientId === 'undefined') {
            return res.status(400).json({ success: false, message: 'ID patient invalide' });
        }

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Seuls les médecins peuvent bloquer un patient' });
        }

        await Connection.upsert(patientId, doctorId, 'blocked', 'doctor');
        res.json({ success: true, message: 'Patient bloqué' });
    } catch (error) {
        console.error('Error blocking connection:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Unblock a patient (Doctor only)
// @route   PUT /api/connections/unblock/:patientId
// @access  Doctor
exports.unblockConnection = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        if (!patientId || patientId === 'undefined') {
            return res.status(400).json({ success: false, message: 'ID patient invalide' });
        }

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Seuls les médecins peuvent débloquer un patient' });
        }

        await Connection.updateStatus(patientId, doctorId, 'accepted');
        res.json({ success: true, message: 'Patient débloqué' });
    } catch (error) {
        console.error('Error unblocking connection:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Get all connections for current user
// @route   GET /api/connections
// @access  Private
exports.getConnections = async (req, res) => {
    try {
        const rows = await Connection.findByUser(req.user.id, req.user.role);
        const connections = rows.map(row => ({
            id: row.id,
            status: row.status,
            requestedBy: row.requested_by,
            createdAt: row.created_at,
            patient: req.user.role === 'doctor' ? {
                id: row.other_id, _id: row.other_id, firstName: row.first_name, lastName: row.last_name,
                email: row.email, phone: row.phone, profilePicture: row.profile_picture
            } : null,
            doctor: req.user.role === 'patient' ? {
                id: row.other_id, _id: row.other_id, firstName: row.first_name, lastName: row.last_name,
                email: row.email, phone: row.phone, specialty: row.specialty, profilePicture: row.profile_picture
            } : null
        }));

        res.json({ success: true, connections });
    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// @desc    Create a dummy patient (Doctor only)
// @route   POST /api/connections/create-dummy
// @access  Doctor
exports.createDummyPatient = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Seuls les médecins peuvent créer des patients manuellement' });
        }

        const { firstName, lastName, phone } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'Le prénom et le nom sont requis' });
        }

        const doctorId = req.user.id;
        const dummyEmail = `patient_${Date.now()}_${Math.floor(Math.random() * 1000)}@psyconnect.local`;
        
        const db = require('../db/mysql');
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, dummyEmail, 'dummy_password_hash', phone || 'Non renseigné', 'patient']
        );
        
        const patientId = result.insertId;

        // Auto connect
        await Connection.create(patientId, doctorId, 'accepted', 'patient');
        
        res.status(201).json({ 
            success: true, 
            message: 'Patient créé avec succès',
            patient: {
                _id: patientId,
                firstName,
                lastName,
                phone,
                email: dummyEmail
            }
        });
    } catch (error) {
        console.error('Error creating dummy patient:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la création du patient' });
    }
};

// @desc    Log a WhatsApp contact event (Patient -> Doctor)
// @route   POST /api/connections/log-contact/:doctorId
// @access  Patient
exports.logWhatsAppContact = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctorId } = req.params;
        const db = require('../db/mysql');
        await db.query(
            `INSERT INTO whatsapp_contacts (patient_id, doctor_id, contacted_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE contacted_at = NOW()`,
            [patientId, doctorId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error logging WhatsApp contact:', error);
        res.status(500).json({ success: false });
    }
};

// @desc    Get last WhatsApp contact time for a patient (Doctor only)
// @route   GET /api/connections/contact-log/:patientId
// @access  Doctor
exports.getContactLog = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { patientId } = req.params;
        const db = require('../db/mysql');
        const [rows] = await db.query(
            'SELECT contacted_at FROM whatsapp_contacts WHERE patient_id = ? AND doctor_id = ?',
            [patientId, doctorId]
        );
        if (rows.length > 0) {
            res.json({ success: true, lastContact: rows[0].contacted_at });
        } else {
            res.json({ success: true, lastContact: null });
        }
    } catch (error) {
        console.error('Error fetching contact log:', error);
        res.status(500).json({ success: false });
    }
};
