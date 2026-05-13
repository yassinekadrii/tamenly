/**
 * @file models/Appointment.js
 * @description MySQL Data Access Object for appointments.
 */

const db = require('../db/mysql');

class Appointment {
  static async create({ patientId, doctorId, startTime, endTime, status, type, notes, meetingLink }) {
    const result = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, start_time, end_time, status, type, notes, meeting_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, startTime, endTime, status || 'pending', type || 'online', notes || '', meetingLink || '']
    );
    return { id: result.insertId, patientId, doctorId, startTime, endTime, status, type };
  }

  static async findByDoctor(doctorId) {
    const rows = await db.query(
      `SELECT a.*, u.first_name, u.last_name, u.email, u.profile_picture
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ?
       ORDER BY a.start_time ASC`,
      [doctorId]
    );
    return rows.map(this._format);
  }

  static async findByPatient(patientId) {
    const rows = await db.query(
      `SELECT a.*, u.first_name, u.last_name, u.email, u.specialty, u.profile_picture
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       WHERE a.patient_id = ?
       ORDER BY a.start_time ASC`,
      [patientId]
    );
    return rows.map(this._format);
  }

  static async findById(id) {
    const rows = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    return true;
  }

  static _format(row) {
    return {
      id: row.id,
      _id: row.id,
      patient: { 
        id: row.patient_id, 
        _id: row.patient_id, 
        firstName: row.first_name, 
        lastName: row.last_name, 
        email: row.email, 
        profilePicture: row.profile_picture 
      },
      doctor: { 
        id: row.doctor_id, 
        _id: row.doctor_id,
        firstName: row.first_name,
        lastName: row.last_name,
        specialty: row.specialty,
        profilePicture: row.profile_picture
      },
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      type: row.type,
      notes: row.notes,
      meetingLink: row.meeting_link,
      createdAt: row.created_at
    };
  }
}

module.exports = Appointment;
