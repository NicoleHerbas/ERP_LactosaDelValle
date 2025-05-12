  const db = require('../config/db');

  const getAllBenefits = async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT b.*, e.nombre, e.apellido 
        FROM beneficios b 
        JOIN empleados e ON b.id_empleado = e.id_empleado 
        WHERE b.estado = 1
      `);
      // Cast monto to number before sending response
      const benefitsWithNumbers = rows.map(row => ({
        ...row,
        monto: Number(row.monto) || 0
      }));
      res.json(benefitsWithNumbers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getBenefitById = async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM beneficios WHERE id_beneficio = ? AND estado = 1',
        [req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Benefit not found' });
      const benefit = { ...rows[0], monto: Number(rows[0].monto) || 0 };
      res.json(benefit);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const createBenefit = async (req, res) => {
    try {
      const { id_empleado, tipo_beneficio, monto, fecha } = req.body;
      const [result] = await db.query(
        'INSERT INTO beneficios (id_empleado, tipo_beneficio, monto, fecha, estado) VALUES (?, ?, ?, ?, 1)',
        [id_empleado, tipo_beneficio, monto, fecha]
      );
      res.json({ id_beneficio: result.insertId, id_empleado, tipo_beneficio, monto: Number(monto) || 0, fecha });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const updateBenefit = async (req, res) => {
    try {
      const { id_empleado, tipo_beneficio, monto, fecha } = req.body;
      const [result] = await db.query(
        'UPDATE beneficios SET id_empleado = ?, tipo_beneficio = ?, monto = ?, fecha = ? WHERE id_beneficio = ? AND estado = 1',
        [id_empleado, tipo_beneficio, monto, fecha, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Benefit not found' });
      res.json({ id_beneficio: req.params.id, id_empleado, tipo_beneficio, monto: Number(monto) || 0, fecha });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const deleteBenefit = async (req, res) => {
    try {
      const [result] = await db.query(
        'UPDATE beneficios SET estado = 0 WHERE id_beneficio = ?',
        [req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Benefit not found' });
      res.json({ message: 'Benefit deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  module.exports = {
    getAllBenefits,
    getBenefitById,
    createBenefit,
    updateBenefit,
    deleteBenefit,
  };
