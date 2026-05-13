/**
 * @file controllers/patientController.js
 * @description Controller for patient-specific actions, such as viewing doctor profiles.
 */

const User = require('../models/User');

// Helper to filter out sensitive info
const filterDoctorInfo = (doctor) => ({
    _id: doctor.id, // For backwards compatibility with frontend expecting _id
    id: doctor.id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    specialty: doctor.specialty,
    bio: doctor.bio,
    profilePicture: doctor.profilePicture,
    certification: doctor.certification,
    cv: doctor.cv,
    phone: doctor.phone, // Added for WhatsApp integration
    availability: doctor.availability,
    location: doctor.location,
    consultationMode: doctor.consultationMode
});

// @desc    Get all doctors (public info only)
// @route   GET /api/patient/doctors
// @access  Public
exports.getAllDoctorsPublic = async (req, res) => {
    try {
        const doctors = await User.findDoctors();
        const filteredDoctors = doctors.map(filterDoctorInfo);

        res.json({
            success: true,
            count: filteredDoctors.length,
            doctors: filteredDoctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des médecins'
        });
    }
};

// @desc    Get a single doctor by ID (public info)
// @route   GET /api/patient/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await User.findDoctorById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Médecin non trouvé.'
            });
        }

        res.json({
            success: true,
            doctor: filterDoctorInfo(doctor)
        });
    } catch (error) {
        console.error('Error fetching doctor by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du médecin'
        });
    }
};
