const db = require('../config/db');

const getAllEmployees = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM empleados WHERE estado = 1');
    // Cast salario to number before sending response
    const employeesWithNumbers = rows.map(row => ({
      ...row,
      salario: Number(row.salario) || 0
    }));
    res.json(employeesWithNumbers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM empleados WHERE id_empleado = ? AND estado = 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    const employee = { ...rows[0], salario: Number(rows[0].salario) || 0 };
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { nombre, apellido, salario, fecha_contratacion } = req.body;
    const [result] = await db.query(
      'INSERT INTO empleados (nombre, apellido, salario, fecha_contratacion, estado) VALUES (?, ?, ?, ?, 1)',
      [nombre, apellido, salario, fecha_contratacion]
    );
    res.json({ id_empleado: result.insertId, nombre, apellido, salario: Number(salario) || 0, fecha_contratacion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { nombre, apellido, salario, fecha_contratacion } = req.body;
    const [result] = await db.query(
      'UPDATE empleados SET nombre = ?, apellido = ?, salario = ?, fecha_contratacion = ? WHERE id_empleado = ? AND estado = 1',
      [nombre, apellido, salario, fecha_contratacion, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ id_empleado: req.params.id, nombre, apellido, salario: Number(salario) || 0, fecha_contratacion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const [result] = await db.query('UPDATE empleados SET estado = 0 WHERE id_empleado = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};