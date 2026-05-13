const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const {
            currentPassword, newPassword,
            firstName, lastName, phone, profilePicture,
            certification, cv, bio, specialty, availability, location, consultationMode
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phone) updateData.phone = phone;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (user.role === 'doctor') {
            if (certification !== undefined) updateData.certification = certification;
            if (cv !== undefined) updateData.cv = cv;
            if (bio !== undefined) updateData.bio = bio;
            if (specialty !== undefined) updateData.specialty = specialty;
            if (availability !== undefined) updateData.availability = availability;
            if (location !== undefined) updateData.location = location;
            if (consultationMode !== undefined) updateData.consultationMode = consultationMode;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Mot de passe actuel requis pour changer le mot de passe' });
            }
            const isMatch = await User.comparePassword(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
            }
            await User.updatePassword(user.id, newPassword);
        }

        await User.update(user.id, updateData);
        const updatedUser = await User.findById(user.id);

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: {
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                certification: updatedUser.certification,
                cv: updatedUser.cv,
                bio: updatedUser.bio,
                specialty: updatedUser.specialty,
                availability: updatedUser.availability,
                location: updatedUser.location,
                consultationMode: updatedUser.consultationMode
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil', debug: error.message });
    }
});

// Upload profile picture
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Veuillez sélectionner une image' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        const avatarUrl = `/uploads/${req.file.filename}`;
        await User.update(user.id, { profilePicture: avatarUrl });

        res.json({ success: true, message: 'Photo de profil mise à jour', profilePicture: avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ success: false, message: error.message || "Erreur lors de l'upload" });
    }
});

module.exports = router;
