const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

router.use(auth);

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Patient
router.post('/', async (req, res) => {
    try {
        const { doctorId, doctor, startTime, endTime, type, notes } = req.body;
        const actualDoctorId = doctorId || doctor;

        if (!actualDoctorId) {
            return res.status(400).json({ success: false, message: 'ID du médecin manquant' });
        }

        const formatDate = (isoStr) => isoStr.replace('T', ' ').replace('Z', '').split('.')[0];

        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId: actualDoctorId,
            startTime: formatDate(startTime),
            endTime: formatDate(endTime),
            type,
            notes
        });

        // Notify the doctor via Socket.io
        if (req.io) {
            req.io.to(`user_${actualDoctorId}`).emit('notification', {
                type: 'new_appointment',
                message: `Nouveau rendez-vous réservé par ${req.user.firstName} ${req.user.lastName}`,
                appointment: {
                    id: appointment.id,
                    startTime: formatDate(startTime),
                    patientName: `${req.user.firstName} ${req.user.lastName}`
                }
            });
        }

        res.status(201).json({ success: true, appointment });
    } catch (error) {
        require('fs').appendFileSync('api-debug.log', `[${new Date().toISOString()}] BOOKING_ERROR: ${error.message}\n${error.stack}\n`);
        console.error('Error booking appointment:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la réservation', debug: error.message });
    }
});

// @route   GET /api/appointments/me
// @desc    Get my appointments (as patient or doctor)
// @access  All
router.get('/me', async (req, res) => {
    try {
        let appointments;
        if (req.user.role === 'doctor') {
            appointments = await Appointment.findByDoctor(req.user.id);
        } else {
            appointments = await Appointment.findByPatient(req.user.id);
        }
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des rendez-vous' });
    }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Doctor
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
        }

        await Appointment.updateStatus(req.params.id, status);
        res.json({ success: true, appointment: { ...appointment, status } });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
    }
});

module.exports = router;
