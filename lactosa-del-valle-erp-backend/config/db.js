const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password', // Update this fallback if needed
    database: process.env.DB_NAME || 'bddlactosa_valle',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('Database pool created successfully');
} catch (error) {
  console.error('Failed to create database pool:', error.message);
  throw error; // This will halt the app and show the error in the terminal
}

module.exports = pool;
