const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const employeeRoutes = require('./routes/employees');
const productionRoutes = require('./routes/production');
const inventarioRoutes = require('./routes/inventario');
const direccionRoutes = require('./routes/direccion');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/employees', employeeRoutes);

// Test database connection
db.query('SELECT 1')
  .then(() => console.log('Conectado a MySQL'))
  .catch(err => console.error('Fallo en la conexión a la BD:', err));

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
