/**
 * @file controllers/messageController.js
 * @description Controller for managing chat messages and conversations.
 */

const Message = require('../models/Message');
const User = require('../models/User');
const Connection = require('../models/Connection');

const analyzeSentiment = (text) => {
    const positiveWords = ['bien', 'heureux', 'merci', 'super', 'génial', 'happy', 'good', 'thanks', 'great', 'سعيد', 'شكرا', 'جميل', 'ممتاز', 'شكراً'];
    const negativeWords = ['triste', 'mal', 'douleur', 'angoisse', 'peur', 'sad', 'bad', 'pain', 'fear', 'anxiety', 'حزين', 'ألم', 'خوف', 'قلق', 'تعبان'];

    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) score += 1;
        if (negativeWords.some(nw => word.includes(nw))) score -= 1;
    });

    let sentiment = 'neutral';
    if (score > 0) sentiment = 'positive';
    if (score < 0) sentiment = 'negative';
    return { sentiment, score };
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Check Connection Permissions
        const isPatientMessagingDoctor = req.user.role === 'patient' && receiver.role === 'doctor';
        const isDoctorMessagingPatient = req.user.role === 'doctor' && receiver.role === 'patient';

        if (isPatientMessagingDoctor || isDoctorMessagingPatient) {
            const patientId = req.user.role === 'patient' ? req.user.id : receiverId;
            const doctorId = req.user.role === 'doctor' ? req.user.id : receiverId;

            console.log(`Checking connection: patient=${patientId}, doctor=${doctorId}`);
            const connection = await Connection.findOne(patientId, doctorId);
            console.log(`Connection found: ${connection ? connection.status : 'NONE'}`);

            if (!connection && isPatientMessagingDoctor) {
                return res.status(403).json({
                    success: false,
                    message: "Vous devez demander une connexion à ce médecin avant d'envoyer un message.",
                    needsConnection: true
                });
            }

            if (connection) {
                if (connection.status === 'pending' && isPatientMessagingDoctor) {
                    return res.status(403).json({ success: false, message: "Votre demande de connexion est en attente d'acceptation.", status: 'pending' });
                }
                if (connection.status === 'blocked') {
                    return res.status(403).json({ success: false, message: 'La communication avec cet utilisateur est bloquée.', status: 'blocked' });
                }
            }
        }

        const { sentiment, score } = analyzeSentiment(content);

        const message = await Message.create({
            senderId: req.user.id,
            receiverId,
            content,
            sentiment,
            moodScore: score
        });

        // Emit via socket if io is available
        if (req.io) {
            const participants = [String(req.user.id), String(receiverId)].sort();
            const roomId = participants.join('-');
            
            req.io.to(roomId).emit('receive-message', {
                _id: message.id,
                id: message.id,
                sender: String(req.user.id),
                receiver: String(receiverId),
                content,
                sentiment,
                moodScore: score,
                createdAt: message.created_at
            });
        }

        res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message", debug: error.message });
    }
};

// Get conversation with a specific user
exports.getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ success: true, messages: [] });
        }
        const messages = await Message.findConversation(currentUserId, userId);
        
        // Map to match frontend expectations (sender/receiver instead of sender_id/receiver_id)
        const mappedMessages = messages.map(m => ({
            ...m,
            _id: m.id,
            sender: m.sender_id,
            receiver: m.receiver_id
        }));

        res.json({ success: true, messages: mappedMessages });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la conversation' });
    }
};

// Get list of conversations (users interacted with)
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const rows = await Message.findByUser(currentUserId);

        const conversations = [];
        const seenUsers = new Set();

        rows.forEach(row => {
            const senderId = row.sender_id;
            const receiverId = row.receiver_id;
            const isSender = senderId == currentUserId;

            const otherId = isSender ? receiverId : senderId;
            const otherFirst = isSender ? row.r_first : row.s_first;
            const otherLast = isSender ? row.r_last : row.s_last;
            const otherRole = isSender ? row.r_role : row.s_role;
            const otherPic = isSender ? row.r_pic : row.s_pic;

            if (!seenUsers.has(otherId)) {
                seenUsers.add(otherId);
                conversations.push({
                    user: { id: otherId, _id: otherId, firstName: otherFirst, lastName: otherLast, role: otherRole, profilePicture: otherPic },
                    lastMessage: row.content,
                    sentiment: row.sentiment,
                    timestamp: row.created_at
                });
            }
        });

        res.json({ success: true, conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des conversations' });
    }
};
