/**
 * @file models/Post.js
 * @description MySQL Data Access Object for doctor blog posts.
 */

const db = require('../db/mysql');

class Post {
  static async create(doctorId, title, content) {
    const result = await db.query(
      'INSERT INTO posts (doctor_id, title, content) VALUES (?, ?, ?)',
      [doctorId, title, content]
    );
    return { id: result.insertId, doctor_id: doctorId, title, content, created_at: new Date() };
  }

  static async findAll() {
    const rows = await db.query(
      `SELECT p.*, u.first_name, u.last_name, u.specialty, u.profile_picture
       FROM posts p
       JOIN users u ON p.doctor_id = u.id
       ORDER BY p.created_at DESC`
    );
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      doctor: {
        id: row.doctor_id,
        firstName: row.first_name,
        lastName: row.last_name,
        specialty: row.specialty,
        profilePicture: row.profile_picture
      }
    }));
  }

  static async findById(id) {
    const rows = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async delete(id) {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Post;
