/**
 * @file models/Mood.js
 * @description MySQL Data Access Object for patient mood tracking.
 */

const db = require('../db/mysql');

class Mood {
  static async create({ patientId, score, label, emoji, note }) {
    const result = await db.query(
      'INSERT INTO moods (patient_id, score, label, emoji, note) VALUES (?, ?, ?, ?, ?)',
      [patientId, score, label, emoji, note || '']
    );
    return { id: result.insertId, patient_id: patientId, score, label, emoji, note };
  }

  static async findByPatient(patientId, limit = 30) {
    const rows = await db.simpleQuery(
      'SELECT * FROM moods WHERE patient_id = ? ORDER BY date DESC LIMIT ?',
      [patientId, Number(limit)]
    );
    return rows;
  }

  static async findLatestByPatient(patientId) {
    const rows = await db.query(
      'SELECT * FROM moods WHERE patient_id = ? ORDER BY date DESC LIMIT 1',
      [patientId]
    );
    return rows[0] || null;
  }
}

module.exports = Mood;
