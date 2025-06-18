const db = require('../config/db');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        c.id_cliente,
        c.nombre,
        c.telefono,
        c.correo,
        c.tipo_cliente,
        c.direccion,
        SUM(v.monto_total) AS volumen
      FROM 
        clientes c
      LEFT JOIN 
        ventas v ON c.id_cliente = v.id_cliente
      WHERE 
        c.estado != 'inactivo'
      GROUP BY 
        c.id_cliente, c.nombre, c.telefono, c.correo, c.tipo_cliente, c.direccion
      ORDER BY 
        c.id_cliente
    `);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Crear cliente
exports.createCliente = async (req, res) => {
  try {
    const { nombre, telefono, correo, tipo_cliente, direccion, rfc } = req.body;
    if (!nombre || !correo || !telefono) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    const [result] = await db.query(`
      INSERT INTO clientes (nombre, telefono, correo, tipo_cliente, direccion, rfc, fechaRegistro, estado)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), 'activo')
    `, [nombre, telefono, correo, tipo_cliente, direccion, rfc]);

    res.status(201).json({ message: 'Cliente registrado', id_cliente: result.insertId });
  } catch (err) {
    console.error('Error al registrar cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Actualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, telefono, correo, tipo_cliente, direccion, rfc, estado } = req.body;
    await db.query(`
      UPDATE clientes SET nombre=?, telefono=?, correo=?, tipo_cliente=?, direccion=?, rfc=?, estado=?, fechaActualizacion=NOW()
      WHERE id_cliente=?
    `, [nombre, telefono, correo, tipo_cliente, direccion, rfc, estado, id]);

    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Eliminar (inhabilitar) cliente
exports.deleteCliente = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query(`UPDATE clientes SET estado='inactivo', fechaActualizacion=NOW() WHERE id_cliente=?`, [id]);
    res.json({ message: 'Cliente eliminado (inhabilitado)' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};


// Obtener historial de compras (ventas) por cliente
exports.getHistorialCompras = async (req, res) => {
  const id = req.params.id;
  try {
    const [ventas] = await db.query(`
      SELECT v.id_venta, v.fecha_venta, dv.id_producto, p.nombre AS producto, dv.cantidad, dv.precio_unitario,
             (dv.cantidad * dv.precio_unitario) AS subtotal
      FROM ventas v
      JOIN detalleventa dv ON v.id_venta = dv.id_venta
      JOIN productos p ON dv.id_producto = p.id_producto
      WHERE v.id_cliente = ?
    `, [id]);

    res.json(ventas);
  } catch (err) {
    console.error('Error al obtener historial de compras:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};
// Obtener preferencias del cliente (productos más comprados)
exports.getPreferenciasCliente = async (req, res) => {
  const id = req.params.id;
  try {
    const [preferencias] = await db.query(`
      SELECT p.nombre, SUM(dv.cantidad) AS total_comprado
      FROM ventas v
      JOIN detalleventa dv ON v.id_venta = dv.id_venta
      JOIN productos p ON dv.id_producto = p.id_producto
      WHERE v.id_cliente = ?
      GROUP BY dv.id_producto
      ORDER BY total_comprado DESC
      LIMIT 3
    `, [id]);

    res.json(preferencias);
  } catch (err) {
    console.error('Error al obtener preferencias:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};
// Obtener clientes con mayor volumen de compra
exports.getClientesPorVolumen = async (req, res) => {
  try {
    const [clientes] = await db.query(`
      SELECT c.id_cliente, c.nombre, SUM(v.monto_total) AS total_compras
      FROM clientes c
      JOIN ventas v ON c.id_cliente = v.id_cliente
      GROUP BY c.id_cliente
      ORDER BY total_compras DESC
    `);

    res.json(clientes);
  } catch (err) {
    console.error('Error al obtener ranking de volumen:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};
