const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const { auth } = require('../middleware/auth');

router.use(auth);

// @route   POST /api/moods
// @desc    Log a daily mood
// @access  Patient
router.post('/', async (req, res) => {
    try {
        const { score, label, emoji, note } = req.body;
        const mood = await Mood.create({ patientId: req.user.id, score, label, emoji, note });
        res.status(201).json({ success: true, mood });
    } catch (error) {
        console.error('Error logging mood:', error);
        res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement de l'humeur" });
    }
});

// @route   GET /api/moods/me
// @desc    Get my mood history
// @access  Patient
router.get('/me', async (req, res) => {
    try {
        const moods = await Mood.findByPatient(req.user.id, 30);
        res.json({ success: true, moods });
    } catch (error) {
        console.error('Error fetching mood history:', error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'historique" });
    }
});

// @route   GET /api/moods/patient/:patientId
// @desc    Get a specific patient's mood history (for doctors)
// @access  Doctor
router.get('/patient/:patientId', async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
        const moods = await Mood.findByPatient(req.params.patientId, 10);
        res.json({ success: true, moods });
    } catch (error) {
        console.error('Error fetching patient mood history:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération' });
    }
});

module.exports = router;
