/**
 * @file models/Connection.js
 * @description MySQL Data Access Object for patient-doctor connections.
 */

const db = require('../db/mysql');

class Connection {
  static async findOne(patientId, doctorId) {
    const rows = await db.query(
      'SELECT * FROM connections WHERE patient_id = ? AND doctor_id = ?',
      [patientId, doctorId]
    );
    return rows[0] || null;
  }

  static async create(patientId, doctorId, status = 'pending', requestedBy = 'patient') {
    const result = await db.query(
      'INSERT INTO connections (patient_id, doctor_id, status, requested_by) VALUES (?, ?, ?, ?)',
      [patientId, doctorId, status, requestedBy]
    );
    return { id: result.insertId, patient_id: patientId, doctor_id: doctorId, status, requested_by: requestedBy };
  }

  static async updateStatus(patientId, doctorId, status) {
    await db.query(
      'UPDATE connections SET status = ? WHERE patient_id = ? AND doctor_id = ?',
      [status, patientId, doctorId]
    );
    return true;
  }

  static async upsert(patientId, doctorId, status, requestedBy = 'doctor') {
    await db.query(
      `INSERT INTO connections (patient_id, doctor_id, status, requested_by) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, requested_by = ?`,
      [patientId, doctorId, status, requestedBy, status, requestedBy]
    );
    return true;
  }

  static async findByUser(userId, role) {
    const column = role === 'doctor' ? 'doctor_id' : 'patient_id';
    const joinColumn = role === 'doctor' ? 'patient_id' : 'doctor_id';
    const joinTable = 'users';

    const rows = await db.query(
      `SELECT c.*, 
        u.id as other_id, u.first_name, u.last_name, u.email, u.phone, u.profile_picture, u.role, u.specialty
       FROM connections c
       JOIN ${joinTable} u ON c.${joinColumn} = u.id
       WHERE c.${column} = ?`,
      [userId]
    );
    return rows;
  }

  static async countDocuments() {
    const rows = await db.query('SELECT COUNT(*) as count FROM connections');
    return rows[0].count;
  }
}

module.exports = Connection;
