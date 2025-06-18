const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes');

router.get('/', clientesController.getClientes);
router.post('/', clientesController.createCliente);
router.put('/:id', clientesController.updateCliente);
router.delete('/:id', clientesController.deleteCliente);
// Historial de compras por cliente
router.get('/:id/historial', clientesController.getHistorialCompras);

// Preferencias de productos
router.get('/:id/preferencias', clientesController.getPreferenciasCliente);

// Ranking por volumen de compra
router.get('/ranking/volumen', clientesController.getClientesPorVolumen);

module.exports = router;
