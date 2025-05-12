const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Ya estás en /api/inventario, así que usa estas rutas:
router.get('/', inventarioController.getInventario); // GET /api/inventario
router.get('/movimientos', inventarioController.getMovimientos); // GET /api/inventario/movimientos

module.exports = router;
