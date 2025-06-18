const express = require('express');
const cors = require('cors');
const db = require('./config/db');


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 🔽 Importar rutas
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const productionRoutes = require('./routes/production');
const inventarioRoutes = require('./routes/inventario');
const direccionRoutes = require('./routes/direccion');
const cotizacionesRoutes = require('./routes/cotizaciones');
const leadsRoutes = require('./routes/leads');
const campaniasRoutes = require('./routes/campanias');
const ventasRoutes = require('./routes/ventas'); // ⬅️ Nuevo
const clientesRoutes = require('./routes/clientes');

// Justo después de los otros app.use()
app.use('/api/clientes1', clientesRoutes);

app.use('/api/ventas', ventasRoutes); // ⬅️ Nuevo

app.use('/api/cotizaciones', cotizacionesRoutes);

app.use('/api/campanias', campaniasRoutes);
// /api/clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const [clientes] = await db.query("SELECT id_cliente AS id, nombre FROM clientes WHERE estado = 'activo'");
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// ✅ RUTAS DESPUÉS DEL MIDDLEWARE
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', require('./routes/performance'));

app.use('/api/production', productionRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/direccion', direccionRoutes);
app.use('/api/leads', leadsRoutes);

// Verifica conexión DB
db.query('SELECT 1')
  .then(() => console.log('Conectado a MySQL'))
  .catch(err => console.error('Fallo en la conexión a la BD:', err));

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
