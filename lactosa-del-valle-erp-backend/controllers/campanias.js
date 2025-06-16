const db = require('../config/db');

exports.getCampanias = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM campanias_marketing WHERE estado = 1');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener campañas:', err);
    res.status(500).json({ error: 'Error al obtener campañas' });
  }
};

exports.createCampania = async (req, res) => {
  console.log("Datos recibidos en el backend:", req.body);

  try {
    const { nombre, fecha_inicio, fecha_fin, presupuesto, descripcion, estado } = req.body;

    if (!nombre || !fecha_inicio || !fecha_fin || !presupuesto || !descripcion || estado === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = `
      INSERT INTO campanias_marketing (nombre, fecha_inicio, fecha_fin, presupuesto, descripcion, estado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [nombre, fecha_inicio, fecha_fin, presupuesto, descripcion, estado]);
    res.status(201).json({ message: 'Campaña creada exitosamente' });

  } catch (error) {
    console.error("Error al crear campaña:", error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.deleteCampania = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('UPDATE campanias_marketing SET estado = 0 WHERE id_campania = ?', [id]);
    res.json({ message: 'Campaña eliminada lógicamente' });
  } catch (err) {
    console.error('Error al eliminar campaña:', err);
    res.status(500).json({ error: 'Error al eliminar campaña' });
  }
};
