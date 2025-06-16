const db = require('../config/db'); // Ajusta según tu conexión MySQL

exports.getCampanas = (req, res) => {
  db.query('SELECT * FROM campanas WHERE estado = 1', (err, results) => {
    if (err) {
      console.error('Error al obtener campañas:', err);
      return res.status(500).json({ error: 'Error al obtener campañas' });
    }
    res.json(results);
  });
};

exports.createCampana = (req, res) => {
  const { nombre_campana, fecha_inicio, fecha_fin, objetivo, estado } = req.body;
  if (!nombre_campana || !fecha_inicio || !fecha_fin || !objetivo) {
    return res.status(400).json({ error: 'Datos incompletos para crear campaña' });
  }
  const query = 'INSERT INTO campanas (nombre_campana, fecha_inicio, fecha_fin, objetivo, estado) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [nombre_campana, fecha_inicio, fecha_fin, objetivo, estado || 1], (err, result) => {
    if (err) {
      console.error('Error al insertar campaña:', err);
      return res.status(500).json({ error: 'Error al crear campaña' });
    }
    res.status(201).json({ message: 'Campaña creada correctamente' });
  });
};

