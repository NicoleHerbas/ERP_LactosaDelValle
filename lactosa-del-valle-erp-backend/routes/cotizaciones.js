const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizaciones');

// Obtener todas las cotizaciones
router.get('/', cotizacionesController.getCotizaciones);

// Crear una nueva cotización con múltiples productos
router.post('/', cotizacionesController.createCotizacion);

// Transformar cotización en venta
router.post('/:id/convertir-a-venta', cotizacionesController.venderCotizacion);

// Obtener productos disponibles
router.get('/productos', cotizacionesController.getProductos);
router.get('/:id', cotizacionesController.getDetalleCotizacion);

module.exports = router;
