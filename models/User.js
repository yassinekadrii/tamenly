/**
 * @file User.js
 * @description MySQL Data Access Object for Users.
 */

const db = require('../db/mysql');
const bcrypt = require('bcryptjs');

class User {
  static mapUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      password: row.password,
      role: row.role,
      isSuperAdmin: Boolean(row.is_super_admin),
      profilePicture: row.profile_picture,
      certification: row.certification,
      cv: row.cv,
      bio: row.bio,
      specialty: row.specialty,
      availability: row.availability,
      location: row.location,
      consultationMode: row.consultation_mode,
      isVerified: Boolean(row.is_verified),
      verificationOTP: row.verification_otp,
      otpExpires: row.otp_expires,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async findById(id) {
    const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return this.mapUser(rows[0]);
  }

  static async findOneByEmail(email) {
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return this.mapUser(rows[0]);
  }

  static async findDoctors() {
    const rows = await db.query('SELECT * FROM users WHERE role = "doctor" ORDER BY created_at DESC');
    return rows.map(row => this.mapUser(row));
  }

  static async findDoctorById(id) {
    const rows = await db.query('SELECT * FROM users WHERE id = ? AND role = "doctor"', [id]);
    return this.mapUser(rows[0]);
  }

  static async create(userData) {
    let { firstName, lastName, email, phone, password, role, isSuperAdmin, isVerified, verificationOTP, otpExpires } = userData;

    // Hash password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    // Format dates for MySQL if provided
    let expires = null;
    if (otpExpires) {
      const date = new Date(otpExpires);
      expires = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    const result = await db.query(
      `INSERT INTO users (
        first_name, last_name, email, phone, password, role, is_super_admin, is_verified, verification_otp, otp_expires
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName, lastName, email, phone, password,
        role || 'patient',
        isSuperAdmin ? 1 : 0,
        isVerified === false ? 0 : 1,
        verificationOTP || null,
        expires
      ]
    );

    return { id: result.insertId, ...userData };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    const dbMapping = {
      firstName: 'first_name',
      lastName: 'last_name',
      phone: 'phone',
      bio: 'bio',
      specialty: 'specialty',
      location: 'location',
      consultationMode: 'consultation_mode',
      profilePicture: 'profile_picture',
      certification: 'certification',
      cv: 'cv',
      availability: 'availability',
      isVerified: 'is_verified',
      verificationOTP: 'verification_otp',
      otpExpires: 'otp_expires'
    };

    for (const [key, val] of Object.entries(data)) {
      if (dbMapping[key] !== undefined) {
        fields.push(`${dbMapping[key]} = ?`);

        if (key === 'otpExpires' && val) {
          const date = new Date(val);
          values.push(date.toISOString().slice(0, 19).replace('T', ' '));
        } else if (key === 'otpExpires' && val === null) {
          values.push(null);
        } else if (key === 'verificationOTP' && val === null) {
          values.push(null);
        } else {
          values.push(val);
        }
      }
    }

    if (fields.length === 0) return true;

    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return true;
  }

  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return true;
  }

  static async comparePassword(candidatePassword, userPasswordHash) {
    return await bcrypt.compare(candidatePassword, userPasswordHash);
  }

  // Used for OTP verification
  static async verifyOTP(email, otp) {
    const rows = await db.query(
      `SELECT * FROM users WHERE email = ? AND verification_otp = ? AND otp_expires > NOW()`,
      [email, otp]
    );
    return this.mapUser(rows[0]);
  }
}

module.exports = User;
