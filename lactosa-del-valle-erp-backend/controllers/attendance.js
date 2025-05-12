const db = require('../config/db');

exports.getAttendance = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT a.*, e.nombre, e.apellido FROM asistencia a LEFT JOIN empleados e ON a.id_empleado = e.id_empleado WHERE a.estado = 1');
    res.json(rows);
  } catch (error) {
    console.error('Error in getAttendance:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
};

exports.getAttendanceById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT a.*, e.nombre, e.apellido FROM asistencia a LEFT JOIN empleados e ON a.id_empleado = e.id_empleado WHERE a.id_asistencia = ? AND a.estado = 1', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Attendance record not found' });
    }
  } catch (error) {
    console.error('Error in getAttendanceById:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
};

exports.getAttendanceByEmployeeAndMonth = async (req, res) => {
  const { id_empleado, month } = req.params;
  try {
    const query = `
      SELECT a.*, e.nombre, e.apellido
      FROM asistencia a
      LEFT JOIN empleados e ON a.id_empleado = e.id_empleado
      WHERE a.id_empleado = ? AND DATE_FORMAT(a.fecha, '%Y-%m') = ? AND a.estado = 1
    `;
    const [rows] = await db.execute(query, [id_empleado, month]);
    res.json(rows);
  } catch (error) {
    console.error('Error in getAttendanceByEmployeeAndMonth:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
};

exports.createAttendance = async (req, res) => {
  const { id_empleado, fecha, hora_entrada, hora_salida, jornada } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO asistencia (id_empleado, fecha, hora_entrada, hora_salida, jornada, estado) VALUES (?, ?, ?, ?, ?, 1)',
      [id_empleado, fecha, hora_entrada, hora_salida, jornada || 1]
    );
    res.status(201).json({ id_asistencia: result.insertId });
  } catch (error) {
    console.error('Error in createAttendance:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create attendance', details: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { id_empleado, fecha, hora_entrada, hora_salida, jornada } = req.body;
  try {
    await db.execute(
      'UPDATE asistencia SET id_empleado = ?, fecha = ?, hora_entrada = ?, hora_salida = ?, jornada = ?, estado = 1 WHERE id_asistencia = ?',
      [id_empleado, fecha, hora_entrada, hora_salida, jornada || 1, id]
    );
    res.json({ message: 'Attendance updated' });
  } catch (error) {
    console.error('Error in updateAttendance:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update attendance', details: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE asistencia SET estado = 0 WHERE id_asistencia = ?', [id]);
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    console.error('Error in deleteAttendance:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete attendance', details: error.message });
  }
};