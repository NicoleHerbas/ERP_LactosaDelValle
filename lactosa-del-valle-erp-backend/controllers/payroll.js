const db = require('../config/db');

const getAllPayrolls = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, e.nombre, e.apellido 
      FROM nominas p 
      JOIN empleados e ON p.id_empleado = e.id_empleado 
      WHERE p.estado = 1
    `);
    // Cast numeric fields to numbers
    const payrollsWithNumbers = rows.map(row => ({
      ...row,
      salario_bruto: Number(row.salario_bruto) || 0,
      deducciones: Number(row.deducciones) || 0,
      salario_neto: Number(row.salario_neto) || 0
    }));
    res.json(payrollsWithNumbers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPayrollById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM nominas WHERE id_nomina = ? AND estado = 1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Payroll not found' });
    const payroll = {
      ...rows[0],
      salario_bruto: Number(rows[0].salario_bruto) || 0,
      deducciones: Number(rows[0].deducciones) || 0,
      salario_neto: Number(rows[0].salario_neto) || 0
    };
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPayroll = async (req, res) => {
  try {
    const { id_empleado, fecha, deducciones } = req.body;

    // Obtener salario del empleado
    const [empleadoRows] = await db.query('SELECT salario FROM empleados WHERE id_empleado = ?', [id_empleado]);
    if (empleadoRows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });

    const salario_bruto = Number(empleadoRows[0].salario);
    const salario_neto = salario_bruto - Number(deducciones || 0);

    const [result] = await db.query(
      'INSERT INTO nominas (id_empleado, fecha, salario_bruto, deducciones, salario_neto, estado) VALUES (?, ?, ?, ?, ?, 1)',
      [id_empleado, fecha, salario_bruto, deducciones, salario_neto]
    );

    res.json({
      id_nomina: result.insertId,
      id_empleado,
      fecha,
      salario_bruto,
      deducciones: Number(deducciones),
      salario_neto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePayroll = async (req, res) => {
  try {
    const { id_empleado, fecha, deducciones } = req.body;

    // Obtener salario del empleado
    const [empleadoRows] = await db.query('SELECT salario FROM empleados WHERE id_empleado = ?', [id_empleado]);
    if (empleadoRows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });

    const salario_bruto = Number(empleadoRows[0].salario);
    const salario_neto = salario_bruto - Number(deducciones || 0);

    const [result] = await db.query(
      'UPDATE nominas SET id_empleado = ?, fecha = ?, salario_bruto = ?, deducciones = ?, salario_neto = ? WHERE id_nomina = ? AND estado = 1',
      [id_empleado, fecha, salario_bruto, deducciones, salario_neto, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Nómina no encontrada' });

    res.json({
      id_nomina: req.params.id,
      id_empleado,
      fecha,
      salario_bruto,
      deducciones: Number(deducciones),
      salario_neto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePayroll = async (req, res) => {
  try {
    const [result] = await db.query('UPDATE nominas SET estado = 0 WHERE id_nomina = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payroll not found' });
    res.json({ message: 'Payroll deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
};
