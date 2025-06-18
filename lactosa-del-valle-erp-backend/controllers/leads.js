const db = require('../config/db');

exports.getLeads = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id_lead, nombre, correo, telefono, fuente, estado
       FROM leads
       WHERE estado != 'eliminado'`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los leads' });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM leads WHERE id_lead = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el lead' });
  }
};

exports.createLead = async (req, res) => {
  const { nombre, correo, telefono, fuente, estado } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO leads (nombre, correo, telefono, fuente, estado) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, telefono, fuente, estado || 'nuevo']
    );
    res.json({ id_lead: result.insertId, nombre, correo, telefono, fuente, estado: estado || 'nuevo' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el lead' });
  }
};

exports.updateLead = async (req, res) => {
  const id = req.params.id;
  const { nombre, correo, telefono, fuente } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE leads SET nombre = ?, correo = ?, telefono = ?, fuente = ? WHERE id_lead = ?',
      [nombre, correo, telefono, fuente, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    res.json({ message: 'Lead actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar lead:', err);
    res.status(500).json({ error: 'Error al actualizar lead' });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    await db.execute('UPDATE leads SET estado = ? WHERE id_lead = ?', ['eliminado', req.params.id]);
    res.json({ message: 'Lead eliminado lógicamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el lead' });
  }
};
