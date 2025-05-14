const db = require('../config/db');
// crear producto
exports.crearProducto = async (req, res) => {
  const { nombre, descripcion, precio = 0.00, fecha_caducidad = null } = req.body;

  try {
    const [existente] = await db.query(`SELECT * FROM Productos WHERE nombre = ?`, [nombre]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'El producto ya existe' });
    }

    await db.query(`
      INSERT INTO Productos (nombre, descripcion, precio, fecha_caducidad, estado)
      VALUES (?, ?, ?, ?, 'activo')`,
      [nombre, descripcion, precio, fecha_caducidad]
    );

    res.json({ message: 'Producto creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto', detalle: err.message });
  }
};


// Obtener el stock actual (producto y cantidad)
exports.getStock = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.nombre AS product, i.cantidad
      FROM Inventario i
      JOIN Productos p ON i.id_producto = p.id_producto
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener stock:', err.message);
    res.status(500).json({ error: 'Error al obtener stock', detalle: err.message });
  }
};

exports.getProductos = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT nombre FROM Productos WHERE estado = 'activo'`);
    res.json(rows);
  } catch (err) {
    console.error(' Error al obtener productos:', err.message);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

exports.createOrder = async (req, res) => {
  const { quantity, product } = req.body;

  try {
    const [[producto]] = await db.query(
      `SELECT id_producto FROM Productos WHERE nombre = ? AND estado = 'activo'`,
      [product.trim()]
    );
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado o inactivo' });

    const idProducto = producto.id_producto;

    const [result] = await db.query(
      `UPDATE Inventario SET cantidad = cantidad - ? WHERE id_producto = ? AND cantidad >= ?`,
      [quantity, idProducto, quantity]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: 'Stock insuficiente' });

    await db.query(
      `INSERT INTO OrdenesProduccion (id_producto, cantidad, estado_logico)
       VALUES (?, ?, 'activo')`,
      [idProducto, quantity]
    );

    res.json({ message: `Orden creada para ${product}, cantidad: ${quantity}` });
  } catch (err) {
    console.error('Error al crear orden:', err.message);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
};

// Obtener todas las órdenes de producción activas
exports.getOrdenesProduccion = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        op.id_orden,
        p.nombre AS producto,
        op.cantidad,
        op.estado,
        op.fechaRegistro
      FROM OrdenesProduccion op
      JOIN Productos p ON op.id_producto = p.id_producto
      WHERE op.estado_logico = 'activo'
      ORDER BY op.fechaRegistro DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener órdenes de producción:', err.message);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// Actualizar estado de la orden (pendiente, en_proceso, completada)
// Actualizar estado de la orden (pendiente, en_proceso, completada)
exports.updateEstadoOrden = async (req, res) => {
  const { id_orden } = req.params;
  const { nuevoEstado, id_empleado = 1 } = req.body; // Se puede enviar el ID del empleado desde el frontend

  const estadosValidos = ['pendiente', 'en_proceso', 'completada'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    if (nuevoEstado === 'completada') {
      // Verificar control de calidad
      const [control] = await db.query(
        `SELECT * FROM ControlCalidad WHERE id_orden = ?`,
        [id_orden]
      );
      if (control.length === 0) {
        return res.status(400).json({
          error: 'No se puede completar la orden sin un registro de control de calidad',
        });
      }

      // Obtener información de la orden
      const [[orden]] = await db.query(
        `SELECT id_producto, cantidad FROM OrdenesProduccion WHERE id_orden = ?`,
        [id_orden]
      );
      const { id_producto, cantidad } = orden;
      const id_almacen = 1; // Puedes cambiarlo o parametrizarlo

      // Verificar si ya existe el registro en inventario
      const [inv] = await db.query(
        `SELECT * FROM Inventario WHERE id_producto = ? AND id_almacen = ? AND estado = 'activo'`,
        [id_producto, id_almacen]
      );

      if (inv.length === 0) {
        await db.query(
          `INSERT INTO Inventario (id_producto, id_almacen, cantidad) VALUES (?, ?, ?)`,
          [id_producto, id_almacen, cantidad]
        );
      } else {
        await db.query(
          `UPDATE Inventario SET cantidad = cantidad + ? WHERE id_producto = ? AND id_almacen = ?`,
          [cantidad, id_producto, id_almacen]
        );
      }

      // Registrar movimiento de inventario
      await db.query(
        `INSERT INTO MovimientosInventario (id_producto, id_almacen, id_empleado, tipo_movimiento, cantidad)
         VALUES (?, ?, ?, 'entrada', ?)`,
        [id_producto, id_almacen, id_empleado, cantidad]
      );
    }

    // Actualizar estado de la orden
    const [result] = await db.query(
      `UPDATE OrdenesProduccion SET estado = ? WHERE id_orden = ?`,
      [nuevoEstado, id_orden]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({ message: `Estado actualizado a "${nuevoEstado}"` });
  } catch (err) {
    console.error('Error al actualizar estado:', err.message);
    res.status(500).json({ error: 'Error al actualizar el estado', detalle: err.message });
  }
};


// Eliminado lógico
exports.eliminarOrden = async (req, res) => {
  const { id_orden } = req.params;
  try {
    const [result] = await db.query(
      `UPDATE OrdenesProduccion SET estado_logico = 'inactivo' WHERE id_orden = ?`,
      [id_orden]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Orden no encontrada o ya eliminada' });
    }
    res.json({ message: 'Orden desactivada (eliminación lógica) con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar orden', detalle: err.message });
  }
};


// Control de calidad
exports.agregarControlCalidad = async (req, res) => {
  const { id_orden, temperatura, ph, observaciones } = req.body;
  try {
    await db.query(`
      INSERT INTO ControlCalidad (id_orden, temperatura, ph, observaciones)
      VALUES (?, ?, ?, ?)`,
      [id_orden, temperatura, ph, observaciones]
    );
    res.json({ message: 'Control de calidad registrado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar control de calidad', detalle: err.message });
  }
};

exports.getControlCalidadPorOrden = async (req, res) => {
  const { id_orden } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT * FROM ControlCalidad WHERE id_orden = ?`,
      [id_orden]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener control de calidad', detalle: err.message });
  }
};

// Proveedores e insumos
exports.getProveedores = async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM Proveedores`);
  res.json(rows);
};

exports.getInsumos = async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM Insumos`);
  res.json(rows);
};

// Compras de insumos
exports.registrarCompraInsumo = async (req, res) => {
  const { id_proveedor, id_insumo, cantidad, fecha_compra } = req.body;
  try {
    await db.query(`
      INSERT INTO ComprasInsumos (id_proveedor, id_insumo, cantidad, fecha_compra)
      VALUES (?, ?, ?, ?)`,
      [id_proveedor, id_insumo, cantidad, fecha_compra]
    );
    res.json({ message: 'Compra registrada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar compra', detalle: err.message });
  }
};
// Obtener compras registradas
exports.getComprasInsumos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ci.id_compra, p.nombre AS proveedor, i.nombre AS insumo, ci.cantidad, ci.fecha_compra
      FROM ComprasInsumos ci
      JOIN Proveedores p ON ci.id_proveedor = p.id_proveedor
      JOIN Insumos i ON ci.id_insumo = i.id_insumo
      ORDER BY ci.fecha_compra DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener compras de insumos', detalle: err.message });
  }
};

// Dashboard de producción
exports.getDashboardProduccion = async (req, res) => {
  try {
    const [ordenes] = await db.query(`SELECT estado, COUNT(*) as total FROM OrdenesProduccion WHERE estado_logico = 'activo' GROUP BY estado`);
    const [topProductos] = await db.query(`
      SELECT p.nombre, SUM(op.cantidad) as total
      FROM OrdenesProduccion op
      JOIN Productos p ON op.id_producto = p.id_producto
      WHERE op.estado_logico = 'activo'
      GROUP BY p.nombre
      ORDER BY total DESC
      LIMIT 5
    `);
    res.json({ ordenes, topProductos });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dashboard', detalle: err.message });
  }
};

// Producción por día
exports.getProduccionPorDia = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(fechaRegistro) AS fecha, SUM(cantidad) AS total
      FROM OrdenesProduccion
      WHERE estado_logico = 'activo'
      GROUP BY fecha
      ORDER BY fecha ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener producción diaria:', err.message);
    res.status(500).json({ error: 'Error al obtener datos de producción diaria' });
  }
};

// Vista detallada de una orden
exports.getDetalleOrden = async (req, res) => {
  const { id } = req.params;
  try {
    const [[orden]] = await db.query(`
      SELECT op.*, p.nombre AS producto
      FROM OrdenesProduccion op
      JOIN Productos p ON op.id_producto = p.id_producto
      WHERE id_orden = ?`, [id]);

    const [[control]] = await db.query(`
      SELECT * FROM ControlCalidad WHERE id_orden = ?`, [id]);

    res.json({ orden, control });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalle de orden' });
  }
};
