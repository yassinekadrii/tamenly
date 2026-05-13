const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const { auth } = require('../middleware/auth');

router.use(auth);

// @route   POST /api/assessments
// @desc    Submit a new preliminary assessment
// @access  Patient
router.post('/', async (req, res) => {
    try {
        const { responses, doctorId } = req.body;

        if (!responses || !Array.isArray(responses)) {
            return res.status(400).json({ success: false, message: 'Réponses invalides.' });
        }

        const totalScore = responses.reduce((acc, curr) => acc + (curr.score || 0), 0);
        let status = 'normal';
        if (totalScore >= 15) status = 'severe';
        else if (totalScore >= 10) status = 'moderate';
        else if (totalScore >= 5) status = 'mild';

        const assessment = await Assessment.create({
            patientId: req.user.id,
            doctorId: doctorId || null,
            responses,
            totalScore,
            status
        });

        res.status(201).json({ success: true, assessment });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la soumission du test.' });
    }
});

// @route   GET /api/assessments/my
// @desc    Get current patient's assessment history
// @access  Patient
router.get('/my', async (req, res) => {
    try {
        const assessments = await Assessment.findByPatient(req.user.id);
        res.json({ success: true, assessments });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ success: false, message: 'Erreur de récupération.' });
    }
});

// @route   GET /api/assessments/patient/:patientId
// @desc    Get specific patient assessments (for doctors)
// @access  Doctor
router.get('/patient/:patientId', async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
        const assessments = await Assessment.findByPatient(req.params.patientId);
        res.json({ success: true, assessments });
    } catch (error) {
        console.error('Error fetching patient assessments:', error);
        res.status(500).json({ success: false, message: 'Erreur de récupération.' });
    }
});

module.exports = router;
