/**
 * @file Prescription.js
 * @description MySQL Data Access Object for medical prescriptions.
 */

const db = require('../db/mysql');

class Prescription {
  static async create(prescriptionData) {
    const { doctorId, patientId, pdf, medicines, instructions, exercises } = prescriptionData;
    
    const connection = await db.getConnection();
    try {
      await connection.query('START TRANSACTION');
      
      const [result] = await connection.query(
        'INSERT INTO prescriptions (doctor_id, patient_id, pdf, instructions, exercises) VALUES (?, ?, ?, ?, ?)',
        [doctorId, patientId, pdf || '', instructions || '', exercises ? JSON.stringify(exercises) : '[]']
      );
      const prescriptionId = result.insertId;
      
      if (medicines && medicines.length > 0) {
        for (const med of medicines) {
          await connection.query(
            'INSERT INTO prescription_medicines (prescription_id, name, dosage, duration, notes) VALUES (?, ?, ?, ?, ?)',
            [prescriptionId, med.name, med.dosage, med.duration, med.notes || '']
          );
        }
      }
      
      await connection.query('COMMIT');
      return { id: prescriptionId, ...prescriptionData };
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByPatientId(patientId) {
    const rows = await db.query(
      `SELECT p.*, pm.id as med_id, pm.name, pm.dosage, pm.duration, pm.notes, u.first_name as doc_fn, u.last_name as doc_ln
       FROM prescriptions p
       JOIN users u ON p.doctor_id = u.id
       LEFT JOIN prescription_medicines pm ON p.id = pm.prescription_id
       WHERE p.patient_id = ?
       ORDER BY p.created_at DESC`,
      [patientId]
    );
    
    return this._formatPrescriptions(rows);
  }

  static async findByDoctorId(doctorId) {
    const rows = await db.query(
      `SELECT p.*, pm.id as med_id, pm.name, pm.dosage, pm.duration, pm.notes 
       FROM prescriptions p
       LEFT JOIN prescription_medicines pm ON p.id = pm.prescription_id
       WHERE p.doctor_id = ?
       ORDER BY p.created_at DESC`,
      [doctorId]
    );
    
    return this._formatPrescriptions(rows);
  }

  static async findById(id) {
    const rows = await db.query(
      `SELECT p.*, pm.id as med_id, pm.name, pm.dosage, pm.duration, pm.notes 
       FROM prescriptions p
       LEFT JOIN prescription_medicines pm ON p.id = pm.prescription_id
       WHERE p.id = ?`,
      [id]
    );
    const prescriptions = this._formatPrescriptions(rows);
    return prescriptions.length > 0 ? prescriptions[0] : null;
  }

  static _formatPrescriptions(rows) {
    const map = new Map();
    for (const row of rows) {
      if (!map.has(row.id)) {
        let exercisesArr = [];
        try {
          exercisesArr = row.exercises ? JSON.parse(row.exercises) : [];
        } catch (e) {}

        map.set(row.id, {
          id: row.id,
          _id: row.id,
          doctor: {
            id: row.doctor_id,
            _id: row.doctor_id,
            firstName: row.doc_fn || '',
            lastName: row.doc_ln || ''
          },
          patient: row.patient_id,
          pdf: row.pdf,
          instructions: row.instructions,
          exercises: exercisesArr,
          createdAt: row.created_at,
          medicines: []
        });
      }
      if (row.med_id) {
        map.get(row.id).medicines.push({
          id: row.med_id,
          name: row.name,
          dosage: row.dosage,
          duration: row.duration,
          notes: row.notes
        });
      }
    }
    return Array.from(map.values());
  }
}

module.exports = Prescription;
