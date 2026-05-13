/**
 * @file scripts/init-db.js
 * @description Script to initialize the MySQL database schema.
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    try {
        console.log('Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || '127.0.0.1',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            multipleStatements: true // Required to run multiple queries from file
        });

        const dbName = process.env.MYSQL_DB || 'psyconnect';
        console.log(`Creating database '${dbName}' if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);

        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await connection.query(schema);

        console.log('✅ Database schema initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();
