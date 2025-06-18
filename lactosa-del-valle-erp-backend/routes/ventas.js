const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas');

router.post('/directa', ventasController.crearVentaDirecta);

module.exports = router;
