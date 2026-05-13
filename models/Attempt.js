/**
 * @file Attempt.js
 * @description MySQL Data Access Object for login/register attempts.
 */

const db = require('../db/mysql');

class Attempt {
  static async create({ email, ip, userAgent, type, status, message }) {
    const result = await db.query(
      `INSERT INTO attempts (email, ip, user_agent, type, status, message) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, ip || 'unknown', userAgent || 'unknown', type, status, message || '']
    );
    return { id: result.insertId, email, type, status };
  }
}

module.exports = Attempt;
