/**
 * @file models/Message.js
 * @description MySQL Data Access Object for chat messages.
 */

const db = require('../db/mysql');

class Message {
  static async create({ senderId, receiverId, content, sentiment, moodScore }) {
    const result = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content, sentiment, mood_score) VALUES (?, ?, ?, ?, ?)',
      [senderId, receiverId, content, sentiment || 'neutral', moodScore || 0]
    );
    return { id: result.insertId, sender_id: senderId, receiver_id: receiverId, content, sentiment, mood_score: moodScore, created_at: new Date() };
  }

  static async findConversation(userId1, userId2) {
    const rows = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId1, userId2, userId2, userId1]
    );
    return rows;
  }

  static async findByUser(userId) {
    const rows = await db.query(
      `SELECT m.*, 
        s.id as s_id, s.first_name as s_first, s.last_name as s_last, s.role as s_role, s.profile_picture as s_pic,
        r.id as r_id, r.first_name as r_first, r.last_name as r_last, r.role as r_role, r.profile_picture as r_pic
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [userId, userId]
    );
    return rows;
  }

  static async countDocuments() {
    const rows = await db.query('SELECT COUNT(*) as count FROM messages');
    return rows[0].count;
  }

  static async markRead(senderId, receiverId) {
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [senderId, receiverId]
    );
    return true;
  }
}

module.exports = Message;
