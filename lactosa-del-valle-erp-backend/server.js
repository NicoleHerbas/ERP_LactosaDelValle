const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);

// Test database connection
db.query('SELECT 1')
  .then(() => console.log('Connected to MySQL database'))
  .catch(err => console.error('Database connection failed:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});