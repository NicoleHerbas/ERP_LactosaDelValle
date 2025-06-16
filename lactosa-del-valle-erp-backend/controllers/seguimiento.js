const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT s.*, v.id_cliente, e.nombre AS empleado
      FROM seguimientopostventa s
      JOIN ventas v ON s.id_venta = v.id_venta
      JOIN empleados e ON s.id_empleado = e.id_empleado
      WHERE s.estado = 'activo'
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  const { id_venta, id_empleado, fecha_seguimiento, comentario } = req.body;
  try {
    const [result] = await db.execute(
      `INSERT INTO seguimientopostventa (id_venta, id_empleado, fecha_seguimiento, comentario, estado)
       VALUES (?, ?, ?, ?, 'activo')`,
      [id_venta, id_empleado, fecha_seguimiento, comentario]
    );
    res.status(201).json({ id_seguimiento: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
