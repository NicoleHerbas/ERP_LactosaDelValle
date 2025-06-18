const db = require('../config/db');

// Obtener todas las cotizaciones con nombre del cliente o lead
exports.getCotizaciones = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT c.id_cotizacion, c.fecha_cotizacion, c.monto_total, c.estado,
             IFNULL(cli.nombre, l.nombre) AS nombre_cliente
      FROM cotizaciones c
      LEFT JOIN clientes cli ON c.id_cliente = cli.id_cliente
      LEFT JOIN leads l ON c.id_cliente = l.id_cliente
      WHERE c.estado != 'eliminada'
    `);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener cotizaciones:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};
// Obtener el detalle de una cotización por ID
exports.getDetalleCotizacion = async (req, res) => {
  try {
    const id = req.params.id;

    const [cotizacion] = await db.query(`
      SELECT c.id_cotizacion, c.fecha_cotizacion, c.monto_total, c.estado,
             IFNULL(cli.nombre, l.nombre) AS nombre_cliente
      FROM cotizaciones c
      LEFT JOIN clientes cli ON c.id_cliente = cli.id_cliente
      LEFT JOIN leads l ON c.id_cliente = l.id_cliente
      WHERE c.id_cotizacion = ?
    `, [id]);

    if (cotizacion.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const [productos] = await db.query(`
      SELECT dc.id_producto, p.nombre, dc.cantidad, dc.precio_unitario
      FROM detallecotizacion dc
      JOIN productos p ON p.id_producto = dc.id_producto
      WHERE dc.id_cotizacion = ?
    `, [id]);

    res.json({
      ...cotizacion[0],
      productos
    });
  } catch (err) {
    console.error('Error al obtener detalle de cotización:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Crear una nueva cotización
exports.createCotizacion = async (req, res) => {
  try {
    const { id_cliente, productos, fecha_cotizacion } = req.body;

    if (!id_cliente || !Array.isArray(productos) || productos.length === 0 || !fecha_cotizacion) {
      return res.status(400).json({ error: 'Datos insuficientes' });
    }

    const monto_total = productos.reduce((total, p) => total + (p.precio_unitario * p.cantidad), 0);

    const [result] = await db.query(`
      INSERT INTO cotizaciones (id_cliente, fecha_cotizacion, monto_total, estado, fechaRegistro)
      VALUES (?, ?, ?, 'pendiente', NOW())
    `, [id_cliente, fecha_cotizacion, monto_total]);

    const id_cotizacion = result.insertId;

    for (const p of productos) {
      await db.query(`
        INSERT INTO detallecotizacion (id_cotizacion, id_producto, cantidad, precio_unitario, fechaRegistro, estado)
        VALUES (?, ?, ?, ?, NOW(), 1)
      `, [id_cotizacion, p.id_producto, p.cantidad, p.precio_unitario]);
    }

    res.status(201).json({ message: 'Cotización registrada', id_cotizacion });
  } catch (error) {
    console.error('Error al registrar cotización:', error);
    res.status(500).json({ error: 'Error interno al registrar cotización' });
  }
};

// Convertir cotización en venta
exports.venderCotizacion = async (req, res) => {
  try {
    const id = req.params.id;
    const [cotizaciones] = await db.query('SELECT * FROM cotizaciones WHERE id_cotizacion = ?', [id]);
    const cot = cotizaciones[0];

    if (!cot) return res.status(404).json({ error: 'Cotización no encontrada' });
    if (cot.estado !== 'pendiente') return res.status(400).json({ error: 'Cotización ya procesada' });

    const [leads] = await db.query('SELECT * FROM leads WHERE id_cliente = ?', [cot.id_cliente]);
    let cliente_id = cot.id_cliente;

    if (leads.length > 0) {
      const lead = leads[0];
      const [result] = await db.query(`
        INSERT INTO clientes (nombre, direccion, rfc, fechaRegistro, estado)
        VALUES (?, '', '', NOW(), 'activo')
      `, [lead.nombre]);
      cliente_id = result.insertId;
      await db.query('UPDATE leads SET estado = ? WHERE id_cliente = ?', ['convertido', lead.id_cliente]);
    }

    const [ventaResult] = await db.query(`
      INSERT INTO ventas (id_cliente, id_empleado, fecha_venta, monto_total, estado, fechaRegistro)
      VALUES (?, 1, NOW(), ?, 'completada', NOW())
    `, [cliente_id, cot.monto_total]);

    const id_venta = ventaResult.insertId;

    const [detalles] = await db.query('SELECT * FROM detallecotizacion WHERE id_cotizacion = ?', [id]);
    for (const d of detalles) {
      await db.query(`
        INSERT INTO detalleventa (id_venta, id_producto, cantidad, precio_unitario, fechaRegistro, estado)
        VALUES (?, ?, ?, ?, NOW(), 'activo')
      `, [id_venta, d.id_producto, d.cantidad, d.precio_unitario]);
    }

    await db.query('UPDATE cotizaciones SET estado = ? WHERE id_cotizacion = ?', ['aceptada', id]);

    res.json({ message: 'Cotización convertida en venta', id_venta });
  } catch (error) {
    console.error('Error al vender cotización:', error);
    res.status(500).json({ error: 'Error interno al vender cotización' });
  }
};

// Obtener productos activos
exports.getProductos = async (req, res) => {
  try {
    const [productos] = await db.query("SELECT id_producto, nombre, precio FROM productos WHERE estado = 'activo'");
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};
