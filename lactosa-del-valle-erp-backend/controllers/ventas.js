const db = require('../config/db');

exports.crearVentaDirecta = async (req, res) => {
  try {
    const { id_cliente, productos } = req.body;
    if (!id_cliente || !productos || productos.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const monto_total = productos.reduce((acc, p) => acc + p.precio_unitario * p.cantidad, 0);
    const [result] = await db.query(`
      INSERT INTO ventas (id_cliente, id_empleado, fecha_venta, monto_total, estado, fechaRegistro)
      VALUES (?, 1, NOW(), ?, 'completada', NOW())`, [id_cliente, monto_total]);

    const id_venta = result.insertId;

    for (const p of productos) {
      await db.query(`
        INSERT INTO detalleventa (id_venta, id_producto, cantidad, precio_unitario, fechaRegistro, estado)
        VALUES (?, ?, ?, ?, NOW(), 'activo')`, [id_venta, p.id_producto, p.cantidad, p.precio_unitario]);
    }

    res.status(201).json({ message: 'Venta directa registrada', id_venta });
  } catch (err) {
    console.error('Error al crear venta directa:', err);
    res.status(500).json({ error: 'Error interno al crear venta' });
  }
};
