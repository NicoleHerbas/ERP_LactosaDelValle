const db = require('../config/db');

exports.getEmployees = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM empleados');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};