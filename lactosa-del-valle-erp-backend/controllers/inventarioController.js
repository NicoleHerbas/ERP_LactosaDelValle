const db = require('../config/db');
exports.getProductos = async (req, res) => {
  const [rows] = await db.query(`SELECT id_producto, nombre FROM Productos WHERE estado = 'activo'`);
  res.json(rows);
};

exports.getAlmacenes = async (req, res) => {
  const [rows] = await db.query(`SELECT id_almacen, nombre FROM Almacenes WHERE estado = 'activo'`);
  res.json(rows);
};

exports.getEmpleados = async (req, res) => {
  const [rows] = await db.query(`SELECT id_empleado, nombre FROM Empleados WHERE estado = 'activo'`);
  res.json(rows);
};

// Obtener inventario actual
exports.getInventario = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.nombre AS producto, a.nombre AS almacen, i.cantidad
      FROM Inventario i
      JOIN Productos p ON i.id_producto = p.id_producto
      JOIN Almacenes a ON i.id_almacen = a.id_almacen
      WHERE i.estado = 'activo'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inventario', detalle: err.message });
  }
};

// Registrar movimiento
exports.registrarMovimiento = async (req, res) => {
  const { id_producto, id_almacen, id_empleado, tipo_movimiento, cantidad } = req.body;
  if (!['entrada', 'salida'].includes(tipo_movimiento)) {
    return res.status(400).json({ error: 'Tipo de movimiento no válido' });
  }

  try {
    const signo = tipo_movimiento === 'entrada' ? 1 : -1;
    const [inventario] = await db.query(
      `SELECT * FROM Inventario WHERE id_producto = ? AND id_almacen = ?`,
      [id_producto, id_almacen]
    );

    if (inventario.length === 0) {
      if (tipo_movimiento === 'salida') {
        return res.status(400).json({ error: 'No hay stock para salida' });
      }
      await db.query(
        `INSERT INTO Inventario (id_producto, id_almacen, cantidad) VALUES (?, ?, ?)`,
        [id_producto, id_almacen, cantidad]
      );
    } else {
      const nuevaCantidad = inventario[0].cantidad + signo * cantidad;
      if (nuevaCantidad < 0) return res.status(400).json({ error: 'Stock insuficiente' });

      await db.query(
        `UPDATE Inventario SET cantidad = ? WHERE id_inventario = ?`,
        [nuevaCantidad, inventario[0].id_inventario]
      );
    }

    await db.query(
      `INSERT INTO MovimientosInventario (id_producto, id_almacen, id_empleado, tipo_movimiento, cantidad)
       VALUES (?, ?, ?, ?, ?)`,
      [id_producto, id_almacen, id_empleado, tipo_movimiento, cantidad]
    );

    res.json({ message: 'Movimiento registrado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar movimiento', detalle: err.message });
  }
};

// Historial de movimientos
exports.getMovimientos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.fecha_movimiento, p.nombre AS producto, a.nombre AS almacen, e.nombre AS empleado,
             m.tipo_movimiento, m.cantidad
      FROM MovimientosInventario m
      JOIN Productos p ON m.id_producto = p.id_producto
      JOIN Almacenes a ON m.id_almacen = a.id_almacen
      JOIN Empleados e ON m.id_empleado = e.id_empleado
      WHERE m.estado = 'activo'
      ORDER BY m.fecha_movimiento DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial', detalle: err.message });
  }
};
