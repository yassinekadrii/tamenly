// db/mysql.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  // Use for queries where execute() fails (like LIMIT ? in older MySQL)
  simpleQuery: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  getConnection: async () => pool.getConnection(),
};
