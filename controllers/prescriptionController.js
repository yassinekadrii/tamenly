/**
 * @file controllers/prescriptionController.js
 * @description Controller for managing medical prescriptions issued by doctors.
 */

const Prescription = require('../models/Prescription');
const User = require('../models/User');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Doctor only
exports.createPrescription = async (req, res) => {
    try {
        const { patientId, medicines, exercises, instructions, pdf } = req.body;

        const hasMedicines = medicines && medicines.length > 0;
        const hasExercises = exercises && exercises.length > 0;

        if (!patientId || (!hasMedicines && !hasExercises && !pdf)) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir un patient et au moins un médicament, un exercice ou un fichier PDF.'
            });
        }

        // Verify patient exists
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé.'
            });
        }

        const prescription = await Prescription.create({
            doctorId: req.user.id,
            patientId: patientId,
            medicines: medicines || [],
            exercises: exercises || [],
            instructions,
            pdf: pdf || ''
        });

        res.status(201).json({
            success: true,
            message: 'Ordonnance créée avec succès.',
            prescription
        });
    } catch (error) {
        console.error('Create prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'ordonnance.',
            error: error.message,
            debug: error.message
        });
    }
};

// @desc    Get prescriptions for a patient (can be called by patient or doctor)
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
exports.getPatientPrescriptions = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Security check: Either the user is the patient themselves, or a doctor
        if (req.user.role !== 'doctor' && req.user.id != patientId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé.'
            });
        }

        const prescriptions = await Prescription.findByPatientId(patientId);

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            prescriptions
        });
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des ordonnances.',
            error: error.message
        });
    }
};
