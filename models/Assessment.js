/**
 * @file models/Assessment.js
 * @description MySQL Data Access Object for patient self-assessments.
 */

const db = require('../db/mysql');

class Assessment {
  static async create({ patientId, doctorId, responses, totalScore, status, notes }) {
    const connection = await db.getConnection();
    try {
      await connection.query('START TRANSACTION');

      const [result] = await connection.query(
        'INSERT INTO assessments (patient_id, doctor_id, total_score, status, notes) VALUES (?, ?, ?, ?, ?)',
        [patientId, doctorId || null, totalScore || 0, status || 'normal', notes || '']
      );
      const assessmentId = result.insertId;

      if (responses && responses.length > 0) {
        for (const r of responses) {
          await connection.query(
            'INSERT INTO assessment_responses (assessment_id, question, answer, score) VALUES (?, ?, ?, ?)',
            [assessmentId, r.question, r.answer, r.score || 0]
          );
        }
      }

      await connection.query('COMMIT');
      return { id: assessmentId, patientId, totalScore, status };
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByPatient(patientId) {
    const rows = await db.query(
      `SELECT a.*, ar.id as res_id, ar.question, ar.answer, ar.score as res_score
       FROM assessments a
       LEFT JOIN assessment_responses ar ON a.id = ar.assessment_id
       WHERE a.patient_id = ?
       ORDER BY a.created_at DESC`,
      [patientId]
    );
    return this._format(rows);
  }

  static async findByDoctor(doctorId) {
    const rows = await db.query(
      `SELECT a.*, ar.id as res_id, ar.question, ar.answer, ar.score as res_score
       FROM assessments a
       LEFT JOIN assessment_responses ar ON a.id = ar.assessment_id
       WHERE a.doctor_id = ?
       ORDER BY a.created_at DESC`,
      [doctorId]
    );
    return this._format(rows);
  }

  static _format(rows) {
    const map = new Map();
    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          patient: row.patient_id,
          doctor: row.doctor_id,
          totalScore: row.total_score,
          status: row.status,
          notes: row.notes,
          createdAt: row.created_at,
          responses: []
        });
      }
      if (row.res_id) {
        map.get(row.id).responses.push({ id: row.res_id, question: row.question, answer: row.answer, score: row.res_score });
      }
    }
    return Array.from(map.values());
  }
}

module.exports = Assessment;
