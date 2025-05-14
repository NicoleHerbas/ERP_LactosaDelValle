const db = require('../config/db');

exports.createEvaluation = async (req, res) => {
  const { id_empleado, fecha_evaluacion, calificacion, comentarios } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO evaluacion (id_empleado, fecha_evaluacion, calificacion, comentarios, estado) VALUES (?, ?, ?, ?, 1)',
      [id_empleado, fecha_evaluacion, calificacion, comentarios]
    );
    res.status(201).json({ id_evaluacion: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar evaluación', detalles: error.message });
  }
};

exports.getEvaluations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id_evaluacion, e.id_empleado, emp.nombre, emp.apellido, e.fecha_evaluacion, e.calificacion, e.comentarios
      FROM evaluacion e
      JOIN empleados emp ON e.id_empleado = emp.id_empleado
      WHERE e.estado = 1
      ORDER BY e.fecha_evaluacion DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evaluaciones', detalles: error.message });
  }
};
